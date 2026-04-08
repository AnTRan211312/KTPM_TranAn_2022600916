package com.TranAn.BackEnd_Works.service.impl;

import com.TranAn.BackEnd_Works.dto.request.ChatRequest;
import com.TranAn.BackEnd_Works.dto.response.ChatMessageDto;
import com.TranAn.BackEnd_Works.dto.response.ChatSessionDto;
import com.TranAn.BackEnd_Works.model.ChatMessage;
import com.TranAn.BackEnd_Works.model.User;
import com.TranAn.BackEnd_Works.model.constant.MessageRole;
import com.TranAn.BackEnd_Works.repository.ChatMessageRepository;
import com.TranAn.BackEnd_Works.repository.UserRepository;
import com.TranAn.BackEnd_Works.service.ChatRedisService;
import com.TranAn.BackEnd_Works.service.ChatService;
import com.TranAn.BackEnd_Works.service.S3Service;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;
import reactor.core.publisher.Flux;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatServiceImpl implements ChatService {

    private final ChatClient chatClient;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatRedisService chatRedisService;
    private final UserRepository userRepository;
    private final S3Service s3Service;
    private final ObjectMapper objectMapper;

    private static final int MAX_HISTORY_MESSAGES = 50;
    private static final Duration REDIS_EXPIRE = Duration.ofHours(24);
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB for images
    private static final long MAX_PDF_SIZE = 20 * 1024 * 1024; // 20MB for PDFs
    private static final int MAX_FILES = 5;
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp");
    private static final Set<String> ALLOWED_DOCUMENT_TYPES = Set.of(
            "application/pdf", "text/plain", "text/markdown");

    @Override
    @Transactional
    public String generation(ChatRequest request, List<MultipartFile> files, String userEmail) {

        // 1. Lấy thông tin user
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + userEmail));

        String userId = user.getId().toString();

        // 2. Lấy lịch sử từ Redis trước
        List<ChatMessage> history = chatRedisService.getChatHistory(userId, request.getSessionId());

        // 3. Nếu Redis không có, load từ Database
        if (history.isEmpty()) {
            history = chatMessageRepository
                    .findByUserAndSessionIdOrderByCreatedAtAsc(user, request.getSessionId())
                    .stream()
                    .limit(MAX_HISTORY_MESSAGES)
                    .collect(Collectors.toList());

            // Cache vào Redis (bulk load toàn bộ từ DB)
            if (!history.isEmpty()) {
                chatRedisService.bulkLoadHistory(userId, request.getSessionId(), history, REDIS_EXPIRE);
            }
        }

        // 4. Xử lý file uploads (nếu có)
        List<String> uploadedUrls = new ArrayList<>();
        List<String> fileTypes = new ArrayList<>();

        if (files != null && !files.isEmpty()) {
            validateFiles(files);

            for (MultipartFile file : files) {
                String contentType = file.getContentType();
                String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                String folder = "chat-attachments";

                // Upload to S3 (don't get public URL yet)
                s3Service.uploadFile(file, folder, fileName, false);

                // Generate presigned URL valid for 1 hour (enough for AI to download)
                String presignedUrl = s3Service.generatePresignedUrl(
                        folder + "/" + fileName,
                        Duration.ofHours(1));

                uploadedUrls.add(presignedUrl);
                fileTypes.add(contentType);

                log.info("Uploaded file {} to S3 with presigned URL", fileName);
            }
        }

        // 5. Tạo và lưu message của user
        ChatMessage userMessage = ChatMessage.builder()
                .user(user)
                .sessionId(request.getSessionId())
                .role(MessageRole.USER)
                .content(request.getQuestion())
                .attachmentUrls(uploadedUrls.isEmpty() ? null : convertListToJson(uploadedUrls))
                .attachmentTypes(fileTypes.isEmpty() ? null : String.join(",", fileTypes))
                .build();

        // Lưu vào Database
        chatMessageRepository.save(userMessage);

        // Thêm vào Redis
        chatRedisService.addMessage(userId, request.getSessionId(), userMessage, REDIS_EXPIRE);

        log.info("User {} sent message in session {} with {} files",
                user.getEmail(), request.getSessionId(), uploadedUrls.size());

        // 6. Xây dựng prompt với lịch sử
        String promptWithHistory = buildPromptWithHistory(history, request.getQuestion());

        // 7. Gọi AI với multimodal support
        String response;
        try {
            if (!uploadedUrls.isEmpty()) {
                // Multimodal prompt with files
                response = chatClient.prompt()
                        .user(u -> {
                            u.text(promptWithHistory);
                            // Add files as media
                            for (int i = 0; i < uploadedUrls.size(); i++) {
                                String url = uploadedUrls.get(i);
                                String mimeType = fileTypes.get(i);
                                try {
                                    if (ALLOWED_IMAGE_TYPES.contains(mimeType)) {
                                        u.media(MimeTypeUtils.parseMimeType(mimeType), new UrlResource(url));
                                    }
                                    // PDFs and documents are already described in text
                                } catch (Exception e) {
                                    log.warn("Could not add file as media: {}", url, e);
                                }
                            }
                        })
                        .call()
                        .content();
            } else {
                // Text-only prompt
                response = chatClient.prompt()
                        .user(promptWithHistory)
                        .call()
                        .content();
            }
        } catch (Exception e) {
            log.error("Error calling AI service", e);
            throw new RuntimeException("Lỗi kết nối AI: " + e.getMessage(), e);
        }

        // 7. Tạo và lưu response của AI
        ChatMessage assistantMessage = ChatMessage.builder()
                .user(user)
                .sessionId(request.getSessionId())
                .role(MessageRole.ASSISTANT)
                .content(response)
                .build();

        // Lưu vào Database
        chatMessageRepository.save(assistantMessage);

        // Thêm vào Redis
        chatRedisService.addMessage(userId, request.getSessionId(), assistantMessage, REDIS_EXPIRE);

        log.info("AI responded in session {}", request.getSessionId());

        return response;
    }

    @Override
    public Flux<String> generationStream(ChatRequest request, String userEmail) {
        // 1. Lấy thông tin user
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + userEmail));

        String userId = user.getId().toString();

        // 2. Lấy lịch sử từ Redis trước
        List<ChatMessage> history = chatRedisService.getChatHistory(userId, request.getSessionId());

        // 3. Nếu Redis không có, load từ Database
        if (history.isEmpty()) {
            history = chatMessageRepository
                    .findByUserAndSessionIdOrderByCreatedAtAsc(user, request.getSessionId())
                    .stream()
                    .limit(MAX_HISTORY_MESSAGES)
                    .collect(Collectors.toList());

            // Cache vào Redis (bulk load toàn bộ từ DB)
            if (!history.isEmpty()) {
                chatRedisService.bulkLoadHistory(userId, request.getSessionId(), history, REDIS_EXPIRE);
            }
        }

        // 4. Lưu message của user trước
        ChatMessage userMessage = ChatMessage.builder()
                .user(user)
                .sessionId(request.getSessionId())
                .role(MessageRole.USER)
                .content(request.getQuestion())
                .build();

        chatMessageRepository.save(userMessage);
        chatRedisService.addMessage(userId, request.getSessionId(), userMessage, REDIS_EXPIRE);

        log.info("User {} sent streaming message in session {}", user.getEmail(), request.getSessionId());

        // 5. Xây dựng prompt với lịch sử
        String promptWithHistory = buildPromptWithHistory(history, request.getQuestion());

        // 6. Accumulator for full response
        StringBuilder responseBuilder = new StringBuilder();

        // 7. Stream response và lưu khi hoàn tất
        return chatClient.prompt()
                .user(promptWithHistory)
                .stream()
                .content()
                .doOnNext(chunk -> responseBuilder.append(chunk))
                .doOnComplete(() -> {
                    // Lưu message AI sau khi stream hoàn tất
                    ChatMessage assistantMessage = ChatMessage.builder()
                            .user(user)
                            .sessionId(request.getSessionId())
                            .role(MessageRole.ASSISTANT)
                            .content(responseBuilder.toString())
                            .build();

                    chatMessageRepository.save(assistantMessage);
                    chatRedisService.addMessage(userId, request.getSessionId(), assistantMessage, REDIS_EXPIRE);

                    log.info("AI streaming completed for session {}", request.getSessionId());
                })
                .doOnError(
                        e -> log.error("Streaming error for session {}: {}", request.getSessionId(), e.getMessage()));
    }

    private String buildPromptWithHistory(List<ChatMessage> history, String currentQuestion) {
        StringBuilder prompt = new StringBuilder();

        if (!history.isEmpty()) {
            prompt.append("=== Lịch sử cuộc hội thoại ===\n\n");
            for (ChatMessage msg : history) {
                String prefix = msg.getRole() == MessageRole.USER ? "👤 Người dùng" : "🤖 Trợ lý";
                prompt.append(prefix).append(": ").append(msg.getContent()).append("\n\n");
            }
            prompt.append("=== Hết lịch sử ===\n\n");
        }

        prompt.append("👤 Người dùng (câu hỏi hiện tại): ").append(currentQuestion);
        prompt.append("\n\n🤖 Trợ lý: ");

        return prompt.toString();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageDto> getChatHistory(String userEmail, String sessionId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        String userId = user.getId().toString();

        // Lấy từ Redis trước
        List<ChatMessage> history = chatRedisService.getChatHistory(userId, sessionId);

        // Nếu Redis không có, load từ Database
        if (history.isEmpty()) {
            history = chatMessageRepository.findByUserAndSessionIdOrderByCreatedAtAsc(user, sessionId);

            // Cache vào Redis (bulk load toàn bộ từ DB)
            if (!history.isEmpty()) {
                chatRedisService.bulkLoadHistory(userId, sessionId, history, REDIS_EXPIRE);
            }
        }

        return history.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void clearChatHistory(String userEmail, String sessionId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        String userId = user.getId().toString();

        // Xóa khỏi Database
        chatMessageRepository.deleteByUserAndSessionId(user, sessionId);

        // Xóa khỏi Redis
        chatRedisService.deleteChatHistory(userId, sessionId);

        log.info("Cleared chat history for user {} in session {}", userEmail, sessionId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean sessionExists(String userEmail, String sessionId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        String userId = user.getId().toString();

        // Kiểm tra Redis trước
        if (chatRedisService.existsChatHistory(userId, sessionId)) {
            return true;
        }

        // Nếu Redis không có, kiểm tra Database
        return chatMessageRepository.existsByUserAndSessionId(user, sessionId);
    }

    @Override
    @Transactional(readOnly = true)
    public long countMessages(String userEmail, String sessionId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        return chatMessageRepository.countByUserAndSessionId(user, sessionId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatSessionDto> getAllSessions(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // Lấy danh sách sessionId từ Database
        List<String> sessionIds = chatMessageRepository.findDistinctSessionIdsByUser(user);

        List<ChatSessionDto> sessions = new ArrayList<>();

        for (String sessionId : sessionIds) {
            // Lấy message đầu tiên và cuối cùng
            ChatMessage firstMessage = chatMessageRepository
                    .findFirstByUserAndSessionIdOrderByCreatedAtAsc(user, sessionId)
                    .orElse(null);

            ChatMessage lastMessage = chatMessageRepository
                    .findFirstByUserAndSessionIdOrderByCreatedAtDesc(user, sessionId)
                    .orElse(null);

            long messageCount = chatMessageRepository.countByUserAndSessionId(user, sessionId);

            if (firstMessage != null && lastMessage != null) {
                // Lấy nội dung của user message (bỏ qua assistant message)
                String firstContent = firstMessage.getRole() == MessageRole.USER
                        ? firstMessage.getContent()
                        : "Chat session";

                String lastContent = lastMessage.getRole() == MessageRole.USER
                        ? lastMessage.getContent()
                        : lastMessage.getContent();

                ChatSessionDto sessionDto = ChatSessionDto.builder()
                        .sessionId(sessionId)
                        .firstMessage(truncateMessage(firstContent, 50))
                        .lastMessage(truncateMessage(lastContent, 50))
                        .messageCount(messageCount)
                        .createdAt(firstMessage.getCreatedAt())
                        .lastMessageTime(lastMessage.getCreatedAt())
                        .build();

                sessions.add(sessionDto);
            }
        }

        return sessions;
    }

    @Override
    public String createSession(String userEmail) {
        // Tạo sessionId mới bằng UUID
        String sessionId = UUID.randomUUID().toString();
        log.info("Created new chat session {} for user {}", sessionId, userEmail);
        return sessionId;
    }

    // Helper: Cắt message quá dài
    private String truncateMessage(String message, int maxLength) {
        if (message == null)
            return "";
        if (message.length() <= maxLength)
            return message;
        return message.substring(0, maxLength) + "...";
    }

    // Helper: Validate uploaded files
    private void validateFiles(List<MultipartFile> files) {
        if (files.size() > MAX_FILES) {
            throw new IllegalArgumentException("Không thể tải lên quá " + MAX_FILES + " files");
        }

        for (MultipartFile file : files) {
            String contentType = file.getContentType();
            long fileSize = file.getSize();

            // Check file type
            if (contentType == null ||
                    (!ALLOWED_IMAGE_TYPES.contains(contentType) && !ALLOWED_DOCUMENT_TYPES.contains(contentType))) {
                throw new IllegalArgumentException("Loại file không được hỗ trợ: " + contentType);
            }

            // Check file size
            if (ALLOWED_IMAGE_TYPES.contains(contentType) && fileSize > MAX_FILE_SIZE) {
                throw new IllegalArgumentException("Ảnh không được vượt quá 10MB");
            }
            if (ALLOWED_DOCUMENT_TYPES.contains(contentType) && fileSize > MAX_PDF_SIZE) {
                throw new IllegalArgumentException("Tài liệu không được vượt quá 20MB");
            }
        }
    }

    // Helper: Convert List to JSON string
    private String convertListToJson(List<String> list) {
        try {
            return objectMapper.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            log.error("Error converting list to JSON", e);
            return "[]";
        }
    }

    // Helper: Convert JSON string to List
    private List<String> convertJsonToList(String json) {
        if (json == null || json.isEmpty()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(json, new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            log.error("Error parsing JSON to list", e);
            return new ArrayList<>();
        }
    }

    private ChatMessageDto convertToDto(ChatMessage message) {
        List<String> attachmentUrls = convertJsonToList(message.getAttachmentUrls());
        List<String> attachmentTypes = message.getAttachmentTypes() != null
                ? Arrays.asList(message.getAttachmentTypes().split(","))
                : new ArrayList<>();

        return ChatMessageDto.builder()
                .id(message.getId())
                .role(message.getRole())
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .createdBy(message.getCreatedBy())
                .attachmentUrls(attachmentUrls.isEmpty() ? null : attachmentUrls)
                .attachmentTypes(attachmentTypes.isEmpty() ? null : attachmentTypes)
                .build();
    }
}