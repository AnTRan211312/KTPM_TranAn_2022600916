package com.TranAn.BackEnd_Works.controller;

import com.TranAn.BackEnd_Works.annotation.ApiMessage;
import com.TranAn.BackEnd_Works.dto.request.ChatRequest;
import com.TranAn.BackEnd_Works.dto.response.ChatMessageDto;
import com.TranAn.BackEnd_Works.dto.response.ChatSessionDto;

import com.TranAn.BackEnd_Works.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Tag(name = "AI Chat", description = "API quản lý chat với AI")
@RestController
@RequiredArgsConstructor
@RequestMapping()
public class ChatController {

    private final ChatService chatService;

    @PostMapping(value = "/chat-message", consumes = {
            org.springframework.http.MediaType.APPLICATION_JSON_VALUE,
            org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE
    })
    @ApiMessage(value = "Gửi tin nhắn thành công")
    @PreAuthorize("hasAuthority('POST /chat-message')")
    @Operation(summary = "Gửi tin nhắn tới AI (hỗ trợ file)", description = "Yêu cầu quyền: <b>POST /chat-message</b>")
    public ResponseEntity<String> chatMessage(
            @Valid @ModelAttribute ChatRequest request,
            @RequestPart(required = false) List<org.springframework.web.multipart.MultipartFile> files,
            Authentication authentication) {

        String userEmail = authentication.getName();
        String response = chatService.generation(request, files, userEmail);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/chat-history/{sessionId}")
    @ApiMessage(value = "Lấy lịch sử chat thành công")
    @PreAuthorize("hasAuthority('GET /chat-history')")
    @Operation(summary = "Lấy lịch sử chat theo sessionId")
    public ResponseEntity<List<ChatMessageDto>> getChatHistory(
            @PathVariable String sessionId,
            Authentication authentication) {

        String userEmail = authentication.getName();
        List<ChatMessageDto> history = chatService.getChatHistory(userEmail, sessionId);
        return ResponseEntity.ok(history);
    }

    @DeleteMapping("/chat-history/{sessionId}")
    @ApiMessage(value = "Xóa lịch sử chat thành công")
    @PreAuthorize("hasAuthority('DELETE /chat-history')")
    @Operation(summary = "Xóa lịch sử chat")
    public ResponseEntity<Void> clearChatHistory(
            @PathVariable String sessionId,
            Authentication authentication) {

        String userEmail = authentication.getName();
        chatService.clearChatHistory(userEmail, sessionId);
        return ResponseEntity.noContent().build();
    }

    // ✨ CẬP NHẬT: Trả về thông tin chi tiết của tất cả sessions
    @PostMapping("/chat-sessions")
    @ApiMessage(value = "Tạo session chat mới thành công")
    @PreAuthorize("hasAuthority('POST /chat-message')")
    @Operation(summary = "Tạo session chat mới", description = "Yêu cầu quyền: <b>POST /chat-message</b>. " +
            "Tạo một session chat mới và trả về sessionId để sử dụng khi gửi tin nhắn.")
    public ResponseEntity<Map<String, String>> createSession(Authentication authentication) {
        String userEmail = authentication.getName();
        String sessionId = chatService.createSession(userEmail);
        Map<String, String> response = new HashMap<>();
        response.put("sessionId", sessionId);
        response.put("message", "Session created successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/chat-sessions")
    @ApiMessage(value = "Lấy danh sách sessions thành công")
    @PreAuthorize("hasAuthority('GET /chat-sessions')")
    @Operation(summary = "Lấy tất cả chat sessions của user với thông tin chi tiết", description = "Yêu cầu quyền: <b>GET /chat-sessions</b>. "
            +
            "Trả về danh sách sessions với message đầu, message cuối, số lượng tin nhắn và thời gian.")
    public ResponseEntity<List<ChatSessionDto>> getAllSessions(Authentication authentication) {
        String userEmail = authentication.getName();
        List<ChatSessionDto> sessions = chatService.getAllSessions(userEmail);
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/chat-session/{sessionId}/info")
    @ApiMessage(value = "Lấy thông tin session thành công")
    @PreAuthorize("hasAuthority('GET /chat-session')")
    @Operation(summary = "Lấy thông tin cơ bản của session chat")
    public ResponseEntity<Map<String, Object>> getSessionInfo(
            @PathVariable String sessionId,
            Authentication authentication) {

        String userEmail = authentication.getName();
        boolean exists = chatService.sessionExists(userEmail, sessionId);
        long messageCount = chatService.countMessages(userEmail, sessionId);

        return ResponseEntity.ok(Map.of(
                "sessionId", sessionId,
                "exists", exists,
                "messageCount", messageCount));
    }
}