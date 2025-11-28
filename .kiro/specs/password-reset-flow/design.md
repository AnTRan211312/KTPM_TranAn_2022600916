# Design Document - Password Reset Flow

## Overview

The password reset flow is a secure, multi-step process that allows users to regain access to their accounts by verifying their identity through OTP sent to their registered email. The flow consists of three main steps:

1. **Forgot Password Step**: User enters email and requests OTP
2. **Verify OTP Step**: User enters the 6-digit OTP received via email
3. **Reset Password Step**: User enters and confirms their new password

The system provides real-time feedback, countdown timers, and clear error messages to guide users through the process.

## Architecture

### Component Structure

```
ForgotPasswordForm (Component 1)
├── Step 1: Forgot Password Form
│   ├── Email Input
│   └── Send OTP Button
└── Step 2: Verify OTP Form
    ├── OTP Input (6 digits)
    ├── Countdown Timer
    ├── Resend Button
    └── Verify Button (navigates to ResetPasswordPage)

ResetPasswordPage (Component 2)
├── New Password Input
├── Confirm Password Input
├── Password Validation Feedback
└── Reset Button
```

### API Endpoints

1. **POST /auth/password/forgot**
   - Request: `{ email: string }`
   - Response: `{ success: boolean, message: string, data: { expiresIn: number, remainingAttempts: number } }`

2. **POST /auth/password/resend-otp**
   - Request: `{ email: string }`
   - Response: `{ success: boolean, message: string, data: { expiresIn: number, remainingAttempts: number } }`

3. **POST /auth/password/verify-otp**
   - Request: `{ email: string, otp: string }`
   - Response: `{ success: boolean, message: string, data: { isValid: boolean, message: string } }`

4. **POST /auth/password/reset**
   - Request: `{ email: string, otp: string, newPassword: string }`
   - Response: `{ success: boolean, message: string }`

## Components and Interfaces

### Frontend Components

**ForgotPasswordForm.tsx**
- Manages two-step password reset flow (forgot password and verify OTP)
- Handles state for email and OTP
- Manages countdown timer for OTP expiration
- Navigates to ResetPasswordPage on successful OTP verification
- Provides user feedback through toast notifications

**State Management (ForgotPasswordForm)**
```typescript
- step: "forgot" | "verify"
- email: string
- otp: string
- isLoading: boolean
- otpExpiresIn: number | null
- remainingAttempts: number | null
```

**ResetPasswordPage.tsx**
- Handles password reset form
- Receives email and OTP from navigation state
- Validates password requirements
- Submits reset password request to backend
- Redirects to login on success

**State Management (ResetPasswordPage)**
```typescript
- newPassword: string
- confirmPassword: string
- isLoading: boolean
- email: string (from location.state)
- otp: string (from location.state)
```

### Backend Services

**AuthService Interface**
- `sendOtpForPasswordReset(request: ForgotPasswordRequestDto): OtpResponseDto`
- `resendOtp(request: ForgotPasswordRequestDto): OtpResponseDto`
- `verifyOtp(request: VerifyOtpRequestDto): VerifyOtpResponseDto`
- `resetPassword(request: ResetPasswordRequestDto): ResetPasswordResponseDto`

**OtpRedisService Interface**
- `generateOtp(): String`
- `saveOtp(email: String, otp: String): void`
- `verifyOtp(email: String, otp: String): boolean`
- `deleteOtp(email: String): void`
- `canSendOtp(email: String): boolean`
- `incrementSendAttempt(email: String): void`

## Data Models

### Request DTOs

```typescript
interface ForgotPasswordRequestDto {
  email: string;
}

interface VerifyOtpRequestDto {
  email: string;
  otp: string;
}

interface ResetPasswordRequestDto {
  email: string;
  otp: string;
  newPassword: string;
}
```

### Response DTOs

```typescript
interface OtpResponseDto {
  message: string;
  expiresIn: number;
  remainingAttempts: number;
}

interface VerifyOtpResponseDto {
  success: boolean;
  message: string;
  isValid: boolean;
}

interface ResetPasswordResponseDto {
  success: boolean;
  message: string;
}
```

### Redis Storage

**OTP Storage**
- Key: `otp:{email}`
- Value: 6-digit OTP string
- TTL: 5 minutes

**Rate Limiting**
- Key: `otp_rate_limit:{email}`
- Value: Number of OTP send attempts
- TTL: 15 minutes
- Max attempts: 3

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: OTP Verification Transitions to Reset Step

*For any* valid email and correct OTP, when the user verifies the OTP, the system SHALL transition from the verify step to the reset step.

**Validates: Requirements 1.3, 3.1**

### Property 2: Invalid OTP Remains on Verify Step

*For any* email and incorrect OTP, when the user attempts to verify, the system SHALL display an error message and remain on the verify step without transitioning.

**Validates: Requirements 1.4**

### Property 3: OTP Expiration Countdown Accuracy

*For any* OTP with a known expiration time, the countdown timer displayed to the user SHALL accurately reflect the remaining time in minutes and seconds.

**Validates: Requirements 1.2**

### Property 4: Password Validation Consistency

*For any* password input, if the password length is less than 6 characters, the system SHALL display a validation error and disable the submit button.

**Validates: Requirements 5.1, 5.3**

### Property 5: Password Confirmation Match

*For any* new password and confirm password inputs, if they do not match, the system SHALL display a mismatch error and disable the submit button. If they match and meet all requirements, the submit button SHALL be enabled.

**Validates: Requirements 5.2, 5.3**

### Property 6: Successful Reset Redirects to Login

*For any* valid email, OTP, and new password, when the user submits the reset password form, the system SHALL redirect to the login page after 2 seconds.

**Validates: Requirements 2.3, 3.3**

### Property 7: Resend Button State Management

*For any* active countdown timer, the resend button SHALL be disabled. When the countdown reaches zero, the resend button SHALL be enabled.

**Validates: Requirements 4.3, 4.4**

### Property 8: Toast Notifications on Success

*For any* successful OTP verification, the system SHALL display a success toast notification with the message "Xác thực OTP thành công".

**Validates: Requirements 2.1**

### Property 9: Toast Notifications on Error

*For any* failed OTP verification, the system SHALL display an error toast notification with the error message from the backend.

**Validates: Requirements 2.2**

## Error Handling

### Frontend Error Handling

1. **Network Errors**: Display generic error message and allow retry
2. **Validation Errors**: Display specific field validation errors
3. **API Errors**: Display error message from backend response
4. **Timeout Errors**: Display timeout message and allow retry

### Backend Error Handling

1. **User Not Found**: Return 404 with message "Không tìm thấy người dùng"
2. **Invalid OTP**: Return 400 with message "Mã OTP không hợp lệ hoặc đã hết hạn"
3. **Rate Limit Exceeded**: Return 429 with message about max attempts
4. **Password Validation**: Return 400 with specific validation error

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples and edge cases:

1. **OTP Generation**: Verify OTP is 6 digits
2. **Email Validation**: Verify email format validation
3. **Password Validation**: Verify password length and match validation
4. **Countdown Timer**: Verify timer decrements correctly
5. **Button State**: Verify buttons enable/disable based on form state

### Property-Based Testing

Property-based tests will verify universal properties using the **fast-check** library (for TypeScript/React) and **JUnit** with property testing (for Java):

1. **OTP Verification Property**: For any valid OTP, verification should succeed and transition to reset step
2. **Invalid OTP Property**: For any invalid OTP, verification should fail and remain on verify step
3. **Password Validation Property**: For any password shorter than 6 characters, validation should fail
4. **Password Match Property**: For any mismatched passwords, submit should be disabled
5. **Countdown Accuracy Property**: For any expiration time, countdown should accurately reflect remaining time
6. **Redirect Property**: For any successful reset, system should redirect to login
7. **Resend Button Property**: For any active countdown, resend button should be disabled

**Testing Framework**: 
- Frontend: Jest with fast-check
- Backend: JUnit 5 with property-based testing library

**Configuration**: Each property-based test will run a minimum of 100 iterations to ensure comprehensive coverage.

### Integration Testing

Integration tests will verify the complete flow:

1. **Complete Password Reset Flow**: User goes through all three steps successfully
2. **Error Recovery**: User recovers from errors and retries
3. **Session Persistence**: Email and OTP are preserved during navigation
4. **Redirect Verification**: User is redirected to login after successful reset
