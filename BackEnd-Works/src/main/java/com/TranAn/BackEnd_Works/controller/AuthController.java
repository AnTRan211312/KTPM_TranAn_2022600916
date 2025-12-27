package com.TranAn.BackEnd_Works.controller;

import com.TranAn.BackEnd_Works.annotation.ApiMessage;
import com.TranAn.BackEnd_Works.dto.request.auth.SessionMetaRequest;
import com.TranAn.BackEnd_Works.dto.request.auth.UserLoginRequestDto;
import com.TranAn.BackEnd_Works.dto.request.auth.UserRegisterRequestDto;
import com.TranAn.BackEnd_Works.dto.response.auth.AuthResult;
import com.TranAn.BackEnd_Works.dto.response.auth.AuthTokenResponseDto;
import com.TranAn.BackEnd_Works.dto.response.auth.SessionMetaResponse;
import com.TranAn.BackEnd_Works.dto.response.user.UserDetailsResponseDto;
import com.TranAn.BackEnd_Works.dto.response.user.UserSessionResponseDto;
import com.TranAn.BackEnd_Works.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;

import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Auth")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    @ApiMessage(value = "Đăng ký thành công")
    @Operation(summary = "người dùng đăng ký")
    @SecurityRequirements()
    public ResponseEntity<UserSessionResponseDto> register(
            @Valid @RequestBody UserRegisterRequestDto userRegisterRequestDto) {
        return ResponseEntity.ok(authService.handleRegister(userRegisterRequestDto));
    }

    @PostMapping("/login")
    @ApiMessage(value = "người dùng đăng nhập thành công")
    @Operation(summary = "người dùng đăng nhập")
    @SecurityRequirements()
    public ResponseEntity<AuthTokenResponseDto> login(
            @Valid @RequestBody UserLoginRequestDto userLoginRequestDto) {
        AuthResult authResult = authService.handleLogin(userLoginRequestDto);
        AuthTokenResponseDto authTokenResponseDto = authResult.getAuthTokenResponseDto();
        ResponseCookie responseCookie = authResult.getResponseCookie();
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, responseCookie.toString())
                .body(authTokenResponseDto);
    }

    @PostMapping("/logout")
    @ApiMessage(value = "người dùng đăng xuất thành công")
    @Operation(summary = "người dùng đăng xuât")
    @SecurityRequirements()
    public ResponseEntity<Void> logout(
            @CookieValue(value = "refresh_token", required = false) String refreshToken) {
        ResponseCookie responseCookie = authService.handleLogout(refreshToken);
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, responseCookie.toString())
                .build();
    }

    @GetMapping("/me")
    @ApiMessage(value = "Trả về thông tin phiên đăng nhập của người dùng hiện tại")
    @Operation(summary = "Lấy thông tin phiên đăng nhập của người dùng hiện tại")
    public ResponseEntity<UserSessionResponseDto> getCurrentUser() {
        return ResponseEntity.ok(authService.getCurrentUser());
    }

    @GetMapping("/me/details")
    @ApiMessage(value = "Trả về thông tin chi tiết của người dùng hiện tại")
    @Operation(summary = "Lấy thông tin chi tiết của người dùng hiện tại")
    public ResponseEntity<UserDetailsResponseDto> getCurrentUserDetails() {
        return ResponseEntity.ok(authService.getCurrentUserDetails());
    }

    @PostMapping("/refresh-token")
    @ApiMessage(value = "Lấy refresh token")
    @Operation(summary = "Cấp lại access token và refresh token mới")
    public ResponseEntity<AuthTokenResponseDto> refreshToken(
            @CookieValue(value = "refresh_token") String refreshToken,
            @RequestBody SessionMetaRequest sessionMetaRequest) {
        System.out.println("DEBUG: /auth/refresh-token called");
        System.out.println("DEBUG: Cookie refresh_token is " + (refreshToken == null ? "NULL" : "PRESENT"));

        AuthResult authResult = authService.handleRefresh(refreshToken, sessionMetaRequest);

        AuthTokenResponseDto authTokenResponseDto = authResult.getAuthTokenResponseDto();
        ResponseCookie responseCookie = authResult.getResponseCookie();

        return ResponseEntity
                .ok()
                .header(HttpHeaders.SET_COOKIE, responseCookie.toString())
                .body(authTokenResponseDto);
    }

    @GetMapping("/sessions")
    @ApiMessage(value = "Lấy session")
    @Operation(summary = "Lấy tất cả phiên đăng nhập của người dùng hiện tại")
    public ResponseEntity<List<SessionMetaResponse>> getAllSelfSessionMetas() {
        return ResponseEntity.ok(authService.getAllSelfSessionMetas());
    }

    @DeleteMapping("/sessions/{sessionId}")
    @ApiMessage(value = "Xóa session")
    @Operation(summary = "Xóa phiên đăng nhập của người dùng theo id phiên")
    public ResponseEntity<Void> removeSelfSession(@PathVariable String sessionId) {
        authService.removeSelfSession(sessionId);

        return ResponseEntity.ok().build();
    }

}
