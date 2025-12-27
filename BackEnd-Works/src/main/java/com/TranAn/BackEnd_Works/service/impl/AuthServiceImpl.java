package com.TranAn.BackEnd_Works.service.impl;

import com.TranAn.BackEnd_Works.config.auth.AuthConfiguration;
import com.TranAn.BackEnd_Works.dto.request.auth.*;
import com.TranAn.BackEnd_Works.dto.response.auth.*;
import com.TranAn.BackEnd_Works.dto.response.user.UserDetailsResponseDto;
import com.TranAn.BackEnd_Works.dto.response.user.UserSessionResponseDto;
import com.TranAn.BackEnd_Works.model.Role;
import com.TranAn.BackEnd_Works.model.User;
import com.TranAn.BackEnd_Works.repository.RoleRepository;
import com.TranAn.BackEnd_Works.repository.UserRepository;
import com.TranAn.BackEnd_Works.service.AuthService;
import com.TranAn.BackEnd_Works.service.EmailService;
import com.TranAn.BackEnd_Works.service.OtpRedisService;
import com.TranAn.BackEnd_Works.service.RefreshTokenRedisService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseCookie;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtEncoder jwtEncoder;
    private final JwtDecoder jwtDecoder;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenRedisService refreshTokenRedisService;
    private final OtpRedisService otpRedisService;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Value("${app.environment:development}")
    private String environment;

    @Value("${jwt.access-token-expiration}")
    public Long accessTokenExpiration;

    @Value("${jwt.refresh-token-expiration}")
    public Long refreshTokenExpiration;

    @Override
    public UserSessionResponseDto handleRegister(UserRegisterRequestDto userRegisterRequestDto) {
        if (userRepository.existsByEmail(userRegisterRequestDto.getEmail()))
            throw new DataIntegrityViolationException("Email đã tồn tại");

        User user = new User(
                userRegisterRequestDto.getEmail(),
                userRegisterRequestDto.getName(),
                passwordEncoder.encode(userRegisterRequestDto.getPassword()),
                userRegisterRequestDto.getDob(),
                userRegisterRequestDto.getAddress(),
                userRegisterRequestDto.getGender());

        Role role;
        if (userRegisterRequestDto.isRecruiter())
            role = roleRepository
                    .findByName("RECRUITER")
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy chức vụ RECRUITER"));
        else
            role = roleRepository
                    .findByName("USER")
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy chức vụ USER"));
        user.setRole(role);

        User savedUser = userRepository.saveAndFlush(user);

        return mapToUserInformation(savedUser);
    }

    @Override
    public AuthResult handleLogin(UserLoginRequestDto userLoginRequestDto) {
        UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(
                userLoginRequestDto.getEmail(),
                userLoginRequestDto.getPassword());

        Authentication authentication = authenticationManager.authenticate(token);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        return buildAuthResult(email, userLoginRequestDto.getSessionMetaRequest());
    }

    @Override
    public ResponseCookie handleLogout(String refreshToken) {
        if (refreshToken != null) {
            String email = jwtDecoder.decode(refreshToken).getSubject();

            User user = userRepository
                    .findByEmail(email)
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));

            refreshTokenRedisService.deleteRefreshToken(refreshToken, user.getId().toString());
        }

        ResponseCookie.ResponseCookieBuilder cookieBuilder = ResponseCookie
                .from("refresh_token", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0);

        // Sử dụng cùng logic SameSite như khi login
        if ("production".equalsIgnoreCase(environment)) {
            cookieBuilder.sameSite("None").secure(true);
        } else {
            cookieBuilder.sameSite("Lax").secure(false);
        }

        return cookieBuilder.build();
    }

    @Override
    public AuthResult handleRefresh(String refreshToken, SessionMetaRequest sessionMetaRequest) {
        String email = jwtDecoder.decode(refreshToken).getSubject();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));
        String userId = user.getId().toString();

        if (!refreshTokenRedisService.validateToken(refreshToken, userId))
            throw new BadJwtException(null);

        if (!user.getEmail().equalsIgnoreCase(email))
            throw new BadJwtException(null);

        refreshTokenRedisService.deleteRefreshToken(refreshToken, userId);

        return buildAuthResult(user, sessionMetaRequest);
    }

    @Override
    public List<SessionMetaResponse> getAllSelfSessionMetas() {
        // Lấy email từ JWT trong Authorization header (SecurityContext)
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));
        String userId = user.getId().toString();

        // Truyền null cho refreshToken - không thể xác định current session
        return refreshTokenRedisService.getAllSessionMetas(userId, null);
    }

    @Override
    public UserDetailsResponseDto getCurrentUserDetails() {
        String currentUserEmail = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User user = userRepository
                .findByEmail(currentUserEmail)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));

        return new UserDetailsResponseDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getDob(),
                user.getAddress(),
                user.getGender(),
                user.getLogoUrl(),
                user.getCreatedAt(),
                user.getUpdatedAt());
    }

    @Override
    public UserSessionResponseDto getCurrentUser() {
        String currentUserEmail = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return mapToUserInformation(currentUserEmail);
    }

    @Override
    public void removeSelfSession(String sessionId) {
        String[] part = sessionId.split(":");
        String sessionUserId = part[3];

        String loginUserId = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
        User user = userRepository
                .findByEmail(loginUserId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));

        if (!user.getId().toString().equalsIgnoreCase(sessionUserId))
            throw new AccessDeniedException("Không có quyền truy cập");

        refreshTokenRedisService.deleteRefreshToken(sessionId);
    }

    @Override
    public OtpResponseDto sendOtpForPasswordReset(ForgotPasswordRequestDto request) {
        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng với email này"));

        // Kiểm tra nếu OTP còn hiệu lực
        if (otpRedisService.isOtpExist(request.getEmail())) {
            throw new IllegalArgumentException(
                    "Mã OTP trước đó vẫn còn hiệu lực. Vui lòng kiểm tra email hoặc đợi 5 phút để gửi lại.");
        }

        // Kiểm tra rate limit
        if (!otpRedisService.canSendOtp(request.getEmail())) {
            int attempts = otpRedisService.getSendAttempts(request.getEmail());
            throw new IllegalArgumentException(
                    "Bạn đã gửi OTP quá " + attempts + " lần. Vui lòng thử lại sau 15 phút.");
        }

        // Tạo mã OTP
        String otp = otpRedisService.generateOtp();

        // Lưu OTP vào Redis
        otpRedisService.saveOtp(request.getEmail(), otp);

        // Tăng số lần gửi
        otpRedisService.incrementSendAttempt(request.getEmail());

        // Gửi email
        emailService.sendOtpEmail(request.getEmail(), otp, user.getName());

        // Tính số lần gửi còn lại
        int currentAttempts = otpRedisService.getSendAttempts(request.getEmail());
        int remainingAttempts = 3 - currentAttempts;

        return new OtpResponseDto(
                true,
                "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.",
                300L, // 5 phút = 300 giây
                remainingAttempts);
    }

    @Override
    public OtpResponseDto resendOtp(ForgotPasswordRequestDto request) {
        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng với email này"));

        // Kiểm tra rate limit
        if (!otpRedisService.canSendOtp(request.getEmail())) {
            int attempts = otpRedisService.getSendAttempts(request.getEmail());
            throw new IllegalArgumentException(
                    "Bạn đã gửi OTP quá " + attempts + " lần. Vui lòng thử lại sau 15 phút.");
        }

        // Xóa OTP cũ (nếu có)
        if (otpRedisService.isOtpExist(request.getEmail())) {
            otpRedisService.deleteOtp(request.getEmail());
        }

        // Tạo mã OTP mới
        String otp = otpRedisService.generateOtp();

        // Lưu OTP mới vào Redis
        otpRedisService.saveOtp(request.getEmail(), otp);

        // Tăng số lần gửi
        otpRedisService.incrementSendAttempt(request.getEmail());

        // Gửi email
        emailService.sendOtpEmail(request.getEmail(), otp, user.getName());

        // Tính số lần gửi còn lại
        int currentAttempts = otpRedisService.getSendAttempts(request.getEmail());
        int remainingAttempts = 3 - currentAttempts;

        return new OtpResponseDto(
                true,
                "Mã OTP mới đã được gửi đến email của bạn.",
                300L,
                remainingAttempts);
    }

    @Override
    public VerifyOtpResponseDto verifyOtp(VerifyOtpRequestDto request) {
        // Kiểm tra user tồn tại
        userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));

        // Xác thực OTP
        boolean isValid = otpRedisService.verifyOtp(request.getEmail(), request.getOtp());

        String message = isValid
                ? "Mã OTP hợp lệ. Bạn có thể tiến hành đặt lại mật khẩu."
                : "Mã OTP không hợp lệ hoặc đã hết hạn.";

        return new VerifyOtpResponseDto(true, message, isValid);
    }

    @Override
    public ResetPasswordResponseDto resetPassword(ResetPasswordRequestDto request) {
        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));

        // Xác thực OTP trước khi reset password
        if (!otpRedisService.verifyOtp(request.getEmail(), request.getOtp())) {
            throw new IllegalArgumentException("Mã OTP không hợp lệ hoặc đã hết hạn");
        }

        // Cập nhật mật khẩu mới
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Xóa OTP sau khi sử dụng
        otpRedisService.deleteOtp(request.getEmail());

        // Reset rate limit sau khi đổi mật khẩu thành công
        otpRedisService.resetRateLimit(request.getEmail());

        return new ResetPasswordResponseDto(
                true,
                "Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập với mật khẩu mới.");
    }
    // ================================================
    // PRIVATE HELPER METHODS
    // ================================================

    private UserSessionResponseDto mapToUserInformation(User user) {
        if (user == null)
            throw new EntityNotFoundException("Không tìm thấy người dùng");

        Role role = user.getRole();
        List<String> permissions = null;
        if (user.getRole() != null && user.getRole().getPermissions() != null)
            permissions = role
                    .getPermissions()
                    .stream()
                    .map(x -> x.getMethod() + " " + x.getApiPath())
                    .toList();

        String companyId = (user.getCompany() == null) ? null : user.getCompany().getId().toString();

        return new UserSessionResponseDto(
                user.getEmail(),
                user.getName(),
                user.getId(),
                companyId,
                role.getName(),
                permissions,
                user.getLogoUrl(),
                user.getUpdatedAt().toString());
    }

    private UserSessionResponseDto mapToUserInformation(String email) {
        if (email == null || email.isBlank())
            throw new EntityNotFoundException("Email không được để trống");

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));

        return mapToUserInformation(user);
    }

    private AuthResult buildAuthResult(String email, SessionMetaRequest sessionMetaRequest) {
        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));

        return buildAuthResult(user, sessionMetaRequest);
    }

    private AuthResult buildAuthResult(User user, SessionMetaRequest sessionMetaRequest) {
        String refreshToken = buildJwt(refreshTokenExpiration, user);
        refreshTokenRedisService.saveRefreshToken(
                refreshToken,
                user.getId().toString(),
                sessionMetaRequest,
                Duration.ofSeconds(refreshTokenExpiration));

        // Bắt đầu xây dựng cookie, nhưng chưa build vội
        ResponseCookie.ResponseCookieBuilder cookieBuilder = ResponseCookie
                .from("refresh_token", refreshToken)
                .httpOnly(true)
                .path("/")
                .maxAge(refreshTokenExpiration);

        // =======================================================
        // == THAY ĐỔI QUAN TRỌNG NHẤT NẰM Ở ĐÂY ==
        // =======================================================
        // Kiểm tra xem có phải môi trường production không
        if ("production".equalsIgnoreCase(environment)) {
            // Nếu là production (chạy trên AWS), bắt buộc phải dùng SameSite=None
            // và Secure=true (để chạy với HTTPS qua CloudFront)
            cookieBuilder.sameSite("None").secure(true);
        } else {
            // Nếu là development (chạy ở local), dùng Lax thay vì Strict
            // vì Strict sẽ KHÔNG gửi cookie trong cross-origin requests
            // (frontend localhost:3000 -> backend localhost:8080 là cross-origin)
            cookieBuilder.sameSite("Lax");
            cookieBuilder.secure(false);
        }
        // =======================================================

        // Bây giờ mới build cookie sau khi đã thêm logic if/else
        ResponseCookie responseCookie = cookieBuilder.build();

        String accessToken = buildJwt(accessTokenExpiration, user);

        AuthTokenResponseDto authTokenResponseDto = new AuthTokenResponseDto(
                mapToUserInformation(user),
                accessToken);

        return new AuthResult(authTokenResponseDto, responseCookie);
    }

    private String buildJwt(Long expirationRate, User user) {
        Instant now = Instant.now();
        Instant validity = now.plus(expirationRate, ChronoUnit.SECONDS);

        JwsHeader jwsHeader = JwsHeader.with(AuthConfiguration.MAC_ALGORITHM).build();

        Role role = user.getRole();
        List<String> permissions = role != null && role.getPermissions() != null
                ? role.getPermissions().stream().map(p -> p.getMethod() + " " + p.getApiPath()).toList()
                : List.of();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuedAt(now)
                .expiresAt(validity)
                .subject(user.getEmail())
                .claim("user", mapToUserInformation(user))
                .claim("permissions", permissions)
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, claims)).getTokenValue();
    }
}