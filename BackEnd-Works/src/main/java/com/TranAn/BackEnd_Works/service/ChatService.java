package com.TranAn.BackEnd_Works.service;

import com.TranAn.BackEnd_Works.dto.request.ChatRequest;
import com.TranAn.BackEnd_Works.dto.response.ChatMessageDto;
import com.TranAn.BackEnd_Works.dto.response.ChatSessionDto;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;

import java.util.List;

public interface ChatService {

    /**
     * Generate AI response for user's question (blocking)
     */
    String generation(ChatRequest request, List<MultipartFile> files, String userEmail);

    /**
     * Generate AI response with SSE streaming (non-blocking)
     */
    Flux<String> generationStream(ChatRequest request, String userEmail);

    /**
     * Get chat history for a specific session
     */
    List<ChatMessageDto> getChatHistory(String userEmail, String sessionId);

    /**
     * Clear chat history for a specific session
     */
    void clearChatHistory(String userEmail, String sessionId);

    /**
     * Check if session exists for user
     */
    boolean sessionExists(String userEmail, String sessionId);

    /**
     * Count messages in a session
     */
    long countMessages(String userEmail, String sessionId);

    /**
     * Get all chat sessions for user with detailed information
     */
    List<ChatSessionDto> getAllSessions(String userEmail);

    /**
     * Create a new chat session and return the sessionId
     */
    String createSession(String userEmail);
}
