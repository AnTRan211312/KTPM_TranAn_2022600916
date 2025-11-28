import axiosClient from "@/lib/axiosClient";
import type { ApiResponse } from "@/types/apiResponse.d.ts";
import type {
  ForgotPasswordRequestDto,
  ResetPasswordRequestDto,
  VerifyOtpRequestDto,
  OtpResponseDto,
  VerifyOtpResponseDto,
  ResetPasswordResponseDto,
} from "@/types/user.d.ts";

/**
 * Bước 1: Gửi mã OTP đến email để đặt lại mật khẩu
 * POST /auth/password/forgot
 * Không yêu cầu authentication
 */
export const forgotPassword = (data: ForgotPasswordRequestDto) => {
  return axiosClient.post<ApiResponse<OtpResponseDto>>(
    "/auth/password/forgot",
    data,
  );
};

/**
 * Bước 1.5: Gửi lại mã OTP mới
 * POST /auth/password/resend-otp
 * Không yêu cầu authentication
 */
export const resendOtp = (data: ForgotPasswordRequestDto) => {
  return axiosClient.post<ApiResponse<OtpResponseDto>>(
    "/auth/password/resend-otp",
    data,
  );
};

/**
 * Bước 2: Xác thực mã OTP (tùy chọn)
 * POST /auth/password/verify-otp
 * Không yêu cầu authentication
 */
export const verifyOtp = (data: VerifyOtpRequestDto) => {
  return axiosClient.post<ApiResponse<VerifyOtpResponseDto>>(
    "/auth/password/verify-otp",
    data,
  );
};

/**
 * Bước 3: Reset mật khẩu với OTP đã xác thực
 * POST /auth/password/reset
 * Không yêu cầu authentication
 */
export const resetPassword = (data: ResetPasswordRequestDto) => {
  return axiosClient.post<ApiResponse<ResetPasswordResponseDto>>(
    "/auth/password/reset",
    data,
  );
};

