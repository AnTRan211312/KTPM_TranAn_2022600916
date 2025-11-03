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
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatServiceImpl implements ChatService {

    private final ChatClient chatClient;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatRedisService chatRedisService;
    private final UserRepository userRepository;

    private static final int MAX_HISTORY_MESSAGES = 50;
    private static final Duration REDIS_EXPIRE = Duration.ofHours(24);

    @Override
    @Transactional
    public String generation(ChatRequest request, String userEmail) {

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

            // Cache vào Redis
            if (!history.isEmpty()) {
                chatRedisService.saveChatHistory(userId, request.getSessionId(), history, REDIS_EXPIRE);
            }
        }

        // 4. Tạo và lưu message của user
        ChatMessage userMessage = ChatMessage.builder()
                .user(user)
                .sessionId(request.getSessionId())
                .role(MessageRole.USER)
                .content(request.getQuestion())
                .build();

        // Lưu vào Database
        chatMessageRepository.save(userMessage);

        // Thêm vào Redis
        chatRedisService.addMessage(userId, request.getSessionId(), userMessage, REDIS_EXPIRE);

        log.info("User {} sent message in session {}", user.getEmail(), request.getSessionId());

        // 5. Xây dựng prompt với lịch sử
        String promptWithHistory = buildPromptWithHistory(history, request.getQuestion());

        // 6. Gọi AI
        String response;
        try {
            response = chatClient.prompt()
                    .user(promptWithHistory)
                    .call()
                    .content();
        } catch (Exception e) {
            log.error("Error calling AI service", e);
            throw new RuntimeException("Không thể kết nối đến AI service. Vui lòng thử lại sau.");
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

            // Cache vào Redis
            if (!history.isEmpty()) {
                chatRedisService.saveChatHistory(userId, sessionId, history, REDIS_EXPIRE);
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
        if (message == null) return "";
        if (message.length() <= maxLength) return message;
        return message.substring(0, maxLength) + "...";
    }

    private ChatMessageDto convertToDto(ChatMessage message) {
        return ChatMessageDto.builder()
                .id(message.getId())
                .role(message.getRole())
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .createdBy(message.getCreatedBy())
                .build();
    }
}