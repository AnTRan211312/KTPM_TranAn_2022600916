package com.TranAn.BackEnd_Works.service.impl;

import com.TranAn.BackEnd_Works.model.ChatMessage;
import com.TranAn.BackEnd_Works.service.ChatRedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatRedisServiceImpl implements ChatRedisService {

    private final RedisTemplate<String, ChatMessage> redisChatTemplate;

    private static final String CHAT_HISTORY_PREFIX = "chat::history:";
    private static final Duration DEFAULT_EXPIRATION = Duration.ofHours(24);

    private String buildKey(String userId, String sessionId) {
        return CHAT_HISTORY_PREFIX + userId + ":" + sessionId;
    }

    // ======================================================================
    // Lấy toàn bộ lịch sử chat bằng LRANGE (đọc atomic)
    // ======================================================================
    @Override
    public List<ChatMessage> getChatHistory(String userId, String sessionId) {
        String key = buildKey(userId, sessionId);
        List<ChatMessage> messages = redisChatTemplate.opsForList().range(key, 0, -1);
        return messages != null ? messages : Collections.emptyList();
    }

    // ======================================================================
    // Thêm 1 message vào cuối list bằng RPUSH (atomic — không race condition)
    // sau đó set lại TTL để đảm bảo luôn tươi
    // ======================================================================
    @Override
    public void addMessage(String userId, String sessionId, ChatMessage message, Duration expire) {
        String key = buildKey(userId, sessionId);
        redisChatTemplate.opsForList().rightPush(key, message);
        redisChatTemplate.expire(key, expire != null ? expire : DEFAULT_EXPIRATION);
    }

    // ======================================================================
    // Bulk load từ DB vào Redis (dùng khi cache miss)
    // Dùng RPUSH nhiều lần — vẫn ổn vì chỉ gọi 1 lần khi cache miss
    // ======================================================================
    public void bulkLoadHistory(String userId, String sessionId, List<ChatMessage> messages, Duration expire) {
        if (messages == null || messages.isEmpty()) return;
        String key = buildKey(userId, sessionId);
        // Xóa key cũ (tránh duplicate nếu gọi nhiều lần)
        redisChatTemplate.delete(key);
        for (ChatMessage message : messages) {
            redisChatTemplate.opsForList().rightPush(key, message);
        }
        redisChatTemplate.expire(key, expire != null ? expire : DEFAULT_EXPIRATION);
    }

    // ======================================================================
    // Xóa lịch sử chat
    // ======================================================================
    @Override
    public void deleteChatHistory(String userId, String sessionId) {
        String key = buildKey(userId, sessionId);
        redisChatTemplate.delete(key);
    }

    // ======================================================================
    // Kiểm tra lịch sử tồn tại không
    // ======================================================================
    @Override
    public boolean existsChatHistory(String userId, String sessionId) {
        String key = buildKey(userId, sessionId);
        Long size = redisChatTemplate.opsForList().size(key);
        return size != null && size > 0;
    }

    // ======================================================================
    // Lấy danh sách sessionId bằng SCAN thay vì KEYS (non-blocking)
    // ======================================================================
    @Override
    public List<String> getAllSessionIds(String userId) {
        String keyPattern = CHAT_HISTORY_PREFIX + userId + ":*";
        List<String> sessionIds = new ArrayList<>();

        ScanOptions scanOptions = ScanOptions.scanOptions()
                .match(keyPattern)
                .count(100) // Xử lý theo batch 100 key mỗi lần
                .build();

        try (Cursor<String> cursor = redisChatTemplate.scan(scanOptions)) {
            while (cursor.hasNext()) {
                String key = cursor.next();
                // Extract sessionId từ key: "chat::history:userId:sessionId"
                String sessionId = key.substring(key.lastIndexOf(":") + 1);
                sessionIds.add(sessionId);
            }
        } catch (Exception e) {
            log.error("Error scanning Redis keys for userId: {}", userId, e);
        }

        return sessionIds;
    }
}
