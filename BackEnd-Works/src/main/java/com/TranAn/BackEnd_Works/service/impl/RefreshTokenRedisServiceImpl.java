package com.TranAn.BackEnd_Works.service.impl;

import com.TranAn.BackEnd_Works.dto.request.auth.SessionMetaRequest;
import com.TranAn.BackEnd_Works.dto.response.auth.SessionMetaResponse;
import com.TranAn.BackEnd_Works.model.SessionMeta;
import com.TranAn.BackEnd_Works.service.RefreshTokenRedisService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RefreshTokenRedisServiceImpl implements RefreshTokenRedisService {

    private final RedisTemplate<String, SessionMeta> redisSessionMetaTemplate;

    private String buildKey(String token, String userId) {
        return "auth::refresh_token:" + userId + ":" + DigestUtils.sha256Hex(token);
    }

    @Override
    public void saveRefreshToken(
            String token, String userId,
            SessionMetaRequest sessionMetaRequest, Duration expire) {
        String sessionId = buildKey(token, userId);
        SessionMeta sessionMeta = new SessionMeta(
                sessionId,
                sessionMetaRequest.getDeviceName(),
                sessionMetaRequest.getDeviceType(),
                sessionMetaRequest.getUserAgent(),
                Instant.now());

        redisSessionMetaTemplate.opsForValue().set(sessionId, sessionMeta, expire);
    }

    @Override
    public boolean validateToken(String token, String userId) {
        return redisSessionMetaTemplate.hasKey(buildKey(token, userId));
    }

    @Override
    public void deleteRefreshToken(String token, String userId) {
        redisSessionMetaTemplate.delete(buildKey(token, userId));
    }

    @Override
    public void deleteRefreshToken(String key) {
        redisSessionMetaTemplate.delete(key);
    }

    @Override
    public List<SessionMetaResponse> getAllSessionMetas(String userId, String currentRefreshToken) {
        String keyPattern = "auth::refresh_token:" + userId + ":*";
        Set<String> keys = redisSessionMetaTemplate.keys(keyPattern);

        if (keys == null || keys.isEmpty())
            return Collections.emptyList();

        // Xử lý trường hợp currentRefreshToken là null (không có cookie)
        // Khi không có cookie, không thể xác định session hiện tại
        String currentTokenHash = (currentRefreshToken != null && !currentRefreshToken.isBlank())
                ? DigestUtils.sha256Hex(currentRefreshToken)
                : null;

        List<SessionMetaResponse> sessionMetas = new ArrayList<>();
        for (String key : keys) {
            SessionMeta meta = redisSessionMetaTemplate.opsForValue().get(key);
            if (meta == null)
                continue;

            String keyHash = key.substring(key.lastIndexOf(":") + 1);
            // Chỉ đánh dấu isCurrent = true nếu có cookie và hash khớp
            boolean isCurrent = currentTokenHash != null && currentTokenHash.equals(keyHash);

            SessionMetaResponse sessionMetaResponse = new SessionMetaResponse(
                    meta.getSessionId(),
                    meta.getDeviceName(),
                    meta.getDeviceType(),
                    meta.getUserAgent(),
                    meta.getLoginAt(),
                    isCurrent);
            sessionMetas.add(sessionMetaResponse);
        }
        return sessionMetas;
    }

}
