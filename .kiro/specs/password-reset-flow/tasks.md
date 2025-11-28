# Implementation Plan - Password Reset Flow

- [ ] 1. Create ResetPasswordPage Component
  - Create new ResetPasswordPage.tsx component
  - Receive email and OTP from navigation state
  - Implement password validation logic
  - Implement password reset form submission
  - Redirect to login on success
  - _Requirements: 1.3, 3.1_

- [ ] 2. Add Reset Password Route
  - Add `/reset-password` route to router
  - Import ResetPasswordPage component
  - Ensure route is accessible without authentication
  - _Requirements: 1.3, 3.1_

- [ ] 3. Update ForgotPasswordForm to Navigate to ResetPasswordPage
  - Remove reset step from ForgotPasswordForm
  - Update handleVerifyOtp to navigate to `/reset-password` instead of changing step
  - Pass email and OTP via navigation state
  - _Requirements: 1.3, 3.1_

- [ ]* 3.1 Write property test for OTP verification transition
  - **Property 1: OTP Verification Transitions to Reset Step**
  - **Validates: Requirements 1.3, 3.1**

- [ ] 4. Implement Frontend Password Validation
  - Implement password length validation (minimum 6 characters)
  - Implement password match validation
  - Add real-time validation feedback
  - Enable/disable submit button based on validation state
  - _Requirements: 5.1, 5.2, 5.3_

- [ ]* 4.1 Write property test for password validation
  - **Property 4: Password Validation Consistency**
  - **Validates: Requirements 5.1, 5.3**

- [ ]* 4.2 Write property test for password confirmation match
  - **Property 5: Password Confirmation Match**
  - **Validates: Requirements 5.2, 5.3**

- [ ] 5. Implement Frontend Toast Notifications
  - Display success toast on OTP verification success
  - Display error toast on OTP verification failure
  - Display success toast on password reset success
  - Display error toast on password reset failure
  - _Requirements: 2.1, 2.2, 2.3_

- [ ]* 5.1 Write property test for success notifications
  - **Property 8: Toast Notifications on Success**
  - **Validates: Requirements 2.1**

- [ ]* 5.2 Write property test for error notifications
  - **Property 9: Toast Notifications on Error**
  - **Validates: Requirements 2.2**

- [ ] 6. Implement Frontend Countdown Timer
  - Create countdown timer that decrements every second
  - Display remaining time in MM:SS format
  - Stop timer when it reaches zero
  - Disable resend button while timer is active
  - _Requirements: 1.2, 4.3, 4.4_

- [ ]* 6.1 Write property test for countdown accuracy
  - **Property 3: OTP Expiration Countdown Accuracy**
  - **Validates: Requirements 1.2**

- [ ]* 6.2 Write property test for resend button state
  - **Property 7: Resend Button State Management**
  - **Validates: Requirements 4.3, 4.4**

- [ ] 7. Implement Frontend Redirect on Success
  - Redirect to login page after successful password reset
  - Add 2-second delay before redirect
  - Display success message before redirect
  - _Requirements: 2.3, 3.3_

- [ ]* 7.1 Write property test for redirect behavior
  - **Property 6: Successful Reset Redirects to Login**
  - **Validates: Requirements 2.3, 3.3**

- [ ] 8. Implement Frontend Invalid OTP Handling
  - Display error message when OTP is invalid
  - Remain on verify step without transitioning
  - Allow user to retry with new OTP
  - _Requirements: 1.4_

- [ ]* 8.1 Write property test for invalid OTP handling
  - **Property 2: Invalid OTP Remains on Verify Step**
  - **Validates: Requirements 1.4**

- [ ] 9. Implement Backend OTP Generation and Storage
  - Generate 6-digit OTP
  - Store OTP in Redis with 5-minute expiration
  - Implement rate limiting (max 3 attempts per 15 minutes)
  - _Requirements: 1.1_

- [ ] 10. Implement Backend OTP Verification
  - Verify OTP against stored value in Redis
  - Return validation result with appropriate message
  - Do not delete OTP on verification (allow multiple verifications)
  - _Requirements: 1.3, 1.4_

- [ ] 11. Implement Backend Password Reset
  - Verify OTP before allowing password reset
  - Update user password with new value
  - Delete OTP after successful reset
  - Reset rate limiting after successful reset
  - _Requirements: 1.5, 3.1_

- [ ] 12. Implement Backend Email Sending
  - Send OTP to user email via email service
  - Include OTP in email template
  - Handle email sending failures gracefully
  - _Requirements: 1.1_

- [ ] 13. Implement Backend Resend OTP
  - Allow user to resend OTP if not received
  - Check rate limiting before sending
  - Update countdown timer on frontend
  - _Requirements: 4.1, 4.2_

- [ ] 14. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Integration Testing
  - Test complete password reset flow end-to-end
  - Test error scenarios and recovery
  - Test session persistence
  - Verify redirect behavior
  - _Requirements: All_

- [ ] 16. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
