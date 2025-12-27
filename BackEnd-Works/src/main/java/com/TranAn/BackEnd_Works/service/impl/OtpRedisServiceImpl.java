package com.TranAn.BackEnd_Works.service.impl;

import com.TranAn.BackEnd_Works.service.OtpRedisService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;

@Service
@RequiredArgsConstructor
public class OtpRedisServiceImpl implements OtpRedisService {

    private final RedisTemplate<String, String> redisTemplate;

    private static final String OTP_PREFIX = "otp:";
    private static final String RATE_LIMIT_PREFIX = "otp_rate_limit:";
    private static final Duration OTP_EXPIRATION = Duration.ofMinutes(5); // OTP hết hạn sau 5 phút
    private static final Duration RATE_LIMIT_DURATION = Duration.ofMinutes(15); // Rate limit 15 phút
    private static final int MAX_ATTEMPTS = 3; // Tối đa 3 lần gửi OTP trong 15 phút

    /**
     * Tạo mã OTP ngẫu nhiên 6 chữ số
     */
    @Override
    public String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = random.nextInt(900000) + 100000; // Tạo số từ 100000 đến 999999
        return String.valueOf(otp);
    }

    /**
     * Lưu OTP vào Redis với email làm key
     */
    @Override
    public void saveOtp(String email, String otp) {
        String key = OTP_PREFIX + email;
        redisTemplate.opsForValue().set(key, otp, OTP_EXPIRATION);
    }

    /**
     * Xác thực OTP
     */
    @Override
    public boolean verifyOtp(String email, String otp) {
        String key = OTP_PREFIX + email;
        String storedOtp = redisTemplate.opsForValue().get(key);

        if (storedOtp == null) {
            return false; // OTP không tồn tại hoặc đã hết hạn
        }

        return storedOtp.equals(otp);
    }

    /**
     * Xóa OTP sau khi sử dụng
     */
    @Override
    public void deleteOtp(String email) {
        String key = OTP_PREFIX + email;
        redisTemplate.delete(key);
    }

    /**
     * Kiểm tra OTP có tồn tại không
     */
    @Override
    public boolean isOtpExist(String email) {
        String key = OTP_PREFIX + email;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    /**
     * Kiểm tra xem có thể gửi OTP không (Rate limiting)
     */
    @Override
    public boolean canSendOtp(String email) {
        String key = RATE_LIMIT_PREFIX + email;
        String attemptsStr = redisTemplate.opsForValue().get(key);

        if (attemptsStr != null) {
            int attempts = Integer.parseInt(attemptsStr);
            return attempts < MAX_ATTEMPTS;
        }

        return true; // Chưa có attempt nào
    }

    /**
     * Tăng số lần gửi OTP
     */
    @Override
    public void incrementSendAttempt(String email) {
        String key = RATE_LIMIT_PREFIX + email;
        String attemptsStr = redisTemplate.opsForValue().get(key);

        if (attemptsStr == null) {
            // Lần đầu tiên gửi OTP
            redisTemplate.opsForValue().set(key, "1", RATE_LIMIT_DURATION);
        } else {
            // Tăng số lần gửi
            redisTemplate.opsForValue().increment(key);
        }
    }

    /**
     * Lấy số lần đã gửi OTP
     */
    @Override
    public int getSendAttempts(String email) {
        String key = RATE_LIMIT_PREFIX + email;
        String attemptsStr = redisTemplate.opsForValue().get(key);

        if (attemptsStr == null) {
            return 0;
        }

        return Integer.parseInt(attemptsStr);
    }

    /**
     * Reset rate limit (dùng cho testing hoặc admin)
     */
    @Override
    public void resetRateLimit(String email) {
        String key = RATE_LIMIT_PREFIX + email;
        redisTemplate.delete(key);
    }
}