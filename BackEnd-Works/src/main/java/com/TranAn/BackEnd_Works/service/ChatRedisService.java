package com.TranAn.BackEnd_Works.service;

import com.TranAn.BackEnd_Works.model.ChatMessage;

import java.time.Duration;
import java.util.List;

public interface ChatRedisService {

    /**
     * Lấy lịch sử chat từ Redis (đọc toàn bộ Redis List)
     */
    List<ChatMessage> getChatHistory(String userId, String sessionId);

    /**
     * Bulk load lịch sử từ DB vào Redis (dùng khi cache miss)
     * Xóa key cũ trước khi ghi để tránh duplicate
     */
    void bulkLoadHistory(String userId, String sessionId, List<ChatMessage> messages, Duration expire);

    /**
     * Thêm một message vào cuối lịch sử (atomic RPUSH — không có race condition)
     */
    void addMessage(String userId, String sessionId, ChatMessage message, Duration expire);

    /**
     * Xóa lịch sử chat
     */
    void deleteChatHistory(String userId, String sessionId);

    /**
     * Kiểm tra lịch sử có tồn tại không
     */
    boolean existsChatHistory(String userId, String sessionId);

    /**
     * Lấy danh sách tất cả sessionId của user (dùng SCAN thay vì KEYS)
     */
    List<String> getAllSessionIds(String userId);
}