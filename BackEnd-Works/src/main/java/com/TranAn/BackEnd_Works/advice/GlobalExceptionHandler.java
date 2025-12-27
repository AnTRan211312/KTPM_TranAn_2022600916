package com.TranAn.BackEnd_Works.advice;

import com.TranAn.BackEnd_Works.advice.exception.ImmutableFieldException;
import com.TranAn.BackEnd_Works.advice.exception.InvalidImageDataException;
import com.TranAn.BackEnd_Works.advice.exception.ResourceAlreadyExistsException;
import com.TranAn.BackEnd_Works.dto.response.ApiResponse;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.jwt.BadJwtException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestCookieException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleEntityNotFoundException(EntityNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(
                        ex.getMessage(),
                        "ENTITY_NOT_FOUND"
                ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleMethodArgumentNotValidException(
            MethodArgumentNotValidException ex) {
        String message = ex
                .getBindingResult()
                .getAllErrors()
                .stream()
                .map(DefaultMessageSourceResolvable::getDefaultMessage)
                .collect(Collectors.joining(", "));

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(
                        message,
                        "VALIDATION_ERROR"
                ));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<?>> handleDataIntegrityViolationException(
            DataIntegrityViolationException ex
    ) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(new ApiResponse<>(
                        ex.getMessage(),
                        "DATA_INTEGRITY_VIOLATION"
                ));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<?>> handleMethodArgumentTypeMismatchException(
            MethodArgumentTypeMismatchException ex
    ) {
        assert ex.getRequiredType() != null;
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(
                        ex.getName() + " phải là " + ex.getRequiredType().getSimpleName(),
                        "PARAM_TYPE_MISMATCH"
                ));
    }

    @ExceptionHandler(value = {
            UsernameNotFoundException.class,
            BadCredentialsException.class
    })
    public ResponseEntity<ApiResponse<?>> handleAuthenticationException() {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse<>(
                        "Thông tin đăng nhập không hợp lệ",
                        "BAD_CREDENTIALS"
                ));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleNoResourceFoundException() {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(
                        "Không tìm thấy URL này",
                        "RESOURCE_NOT_FOUND"
                ));
    }

    @ExceptionHandler(MissingRequestCookieException.class)
    public ResponseEntity<ApiResponse<?>> handleMissingRequestCookieException(
            MissingRequestCookieException ex
    ) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse<>(
                        "Không tìm thấy cookie " + ex.getCookieName(),
                        "MISSING_COOKIE"
                ));
    }

    @ExceptionHandler(BadJwtException.class)
    public ResponseEntity<ApiResponse<?>> handleBadJwtException(
            BadJwtException ex
    ) {
        String message = "Token không hợp lệ (không đúng định dạng, hết hạn)";
        if (ex.getMessage() != null)
            message = ex.getMessage();

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse<>(
                        message,
                        "UNAUTHORIZED"
                ));
    }

    @ExceptionHandler(ResourceAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<?>> handleResourceAlreadyExistsException(
            ResourceAlreadyExistsException ex
    ) {
        String message = "Tài nguyên này đã tồn tại";
        if (ex.getMessage() != null)
            message = ex.getMessage();


        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(new ApiResponse<>(
                        message,
                        "ENTITY_ALREADY_EXISTS"
                ));
    }

    @ExceptionHandler(InvalidImageDataException.class)
    public ResponseEntity<ApiResponse<?>> handleInvalidImageDataException(
            InvalidImageDataException ex
    ) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(
                        ex.getMessage(),
                        "INVALID_IMAGE_DATA"
                ));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<?>> handleAccessDeniedException(
            AccessDeniedException ex
    ) {
        String message = "Không có quyền truy cập";
        if (ex.getMessage() != null)
            message = ex.getMessage();


        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse<>(
                        message,
                        "ACCESS_DENIED"
                ));
    }

    @ExceptionHandler(AuthorizationDeniedException.class)
    public ResponseEntity<ApiResponse<?>> handleAuthorizationDeniedException(
            AuthorizationDeniedException ex
    ) {
        String message = "Không có quyền truy cập";
        if (ex.getMessage() != null)
            message = ex.getMessage();


        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse<>(
                        message,
                        "ACCESS_DENIED"
                ));
    }

    @ExceptionHandler(ImmutableFieldException.class)
    public ResponseEntity<ApiResponse<?>> handleImmutableFieldException(
            ImmutableFieldException ex
    ) {
        String message = "Không có quyền truy cập";
        if (ex.getMessage() != null)
            message = ex.getMessage();

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse<>(
                        message,
                        "IMMUTABLE_FIELD"
                ));
    }


    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<?>> handleIllegalArgumentException(
            IllegalArgumentException ex
    ) {
        // 1. Gán thông báo mặc định (nếu cần)
        String message = "Otp không hợp lệ";

        // 2. Kiểm tra và sử dụng thông báo chi tiết từ Service
        if (ex.getMessage() != null && !ex.getMessage().isEmpty()) {
            message = ex.getMessage();
        }

        // 3. Trả về phản hồi chuẩn
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(
                        message, // Sẽ là thông báo chi tiết về Rate Limit, OTP hết hạn, v.v.
                        "INVALID_ARGUMENT"
                ));
    }

}

