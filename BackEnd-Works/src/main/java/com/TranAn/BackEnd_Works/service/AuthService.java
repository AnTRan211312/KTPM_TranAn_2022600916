package com.TranAn.BackEnd_Works.service;

import com.TranAn.BackEnd_Works.dto.request.auth.*;
import com.TranAn.BackEnd_Works.dto.response.auth.*;
import com.TranAn.BackEnd_Works.dto.response.user.UserDetailsResponseDto;
import com.TranAn.BackEnd_Works.dto.response.user.UserSessionResponseDto;
import org.springframework.http.ResponseCookie;

import java.util.List;

public interface AuthService {

    UserSessionResponseDto handleRegister(UserRegisterRequestDto userRegisterRequestDto);

    AuthResult handleLogin(UserLoginRequestDto userLoginRequestDto);

    ResponseCookie handleLogout(String refreshToken);

    AuthResult handleRefresh(String refreshToken, SessionMetaRequest sessionMetaRequest);

    List<SessionMetaResponse> getAllSelfSessionMetas(String refreshToken);

    UserDetailsResponseDto getCurrentUserDetails();

    UserSessionResponseDto getCurrentUser();

    void removeSelfSession(String sessionId);

    OtpResponseDto sendOtpForPasswordReset(ForgotPasswordRequestDto request);

    OtpResponseDto resendOtp(ForgotPasswordRequestDto request);

    VerifyOtpResponseDto verifyOtp(VerifyOtpRequestDto request);

    ResetPasswordResponseDto resetPassword(ResetPasswordRequestDto request);
}
