# Requirements Document - Password Reset Flow

## Introduction

The password reset feature allows users to securely reset their forgotten passwords through a multi-step verification process using OTP (One-Time Password) sent to their registered email address. The system ensures security by validating the OTP before allowing password changes.

## Glossary

- **OTP (One-Time Password)**: A 6-digit code sent to the user's email for verification purposes
- **Password Reset Flow**: A multi-step process consisting of: forgot password → verify OTP → reset password
- **Email Verification**: Confirming user identity by validating the OTP sent to their registered email
- **Frontend**: React-based client application (TalentBridge-Frontend)
- **Backend**: Spring Boot REST API (BackEnd-Works)
- **Redis**: In-memory data store used for OTP storage and rate limiting

## Requirements

### Requirement 1

**User Story:** As a user, I want to reset my forgotten password, so that I can regain access to my account.

#### Acceptance Criteria

1. WHEN a user enters their email and requests an OTP THEN the system SHALL send a 6-digit OTP to their registered email address
2. WHEN an OTP is sent THEN the system SHALL display the OTP verification screen with a countdown timer showing expiration time
3. WHEN a user enters a valid OTP THEN the system SHALL verify it and transition to the password reset screen
4. WHEN a user enters an invalid OTP THEN the system SHALL display an error message and remain on the verification screen
5. WHEN a user successfully verifies the OTP THEN the system SHALL allow them to enter a new password

### Requirement 2

**User Story:** As a user, I want to receive clear feedback during the password reset process, so that I understand what is happening at each step.

#### Acceptance Criteria

1. WHEN the OTP verification is successful THEN the system SHALL display a success toast notification
2. WHEN the OTP verification fails THEN the system SHALL display an error toast notification with the reason
3. WHEN the password reset is successful THEN the system SHALL display a success message and redirect to login
4. WHEN the password reset fails THEN the system SHALL display an error message and allow retry

### Requirement 3

**User Story:** As a system, I want to ensure the password reset flow transitions correctly between steps, so that users can complete the process without getting stuck.

#### Acceptance Criteria

1. WHEN OTP verification succeeds THEN the system SHALL transition from verify step to reset step
2. WHEN a user clicks back button THEN the system SHALL return to the previous step
3. WHEN password reset is completed THEN the system SHALL redirect to the login page after 2 seconds
4. WHEN the user navigates away THEN the system SHALL preserve the email and OTP for the current session

### Requirement 4

**User Story:** As a user, I want to resend the OTP if I didn't receive it, so that I can complete the verification process.

#### Acceptance Criteria

1. WHEN a user clicks the resend button THEN the system SHALL send a new OTP to their email
2. WHEN OTP is resent THEN the system SHALL reset the countdown timer
3. WHEN the countdown timer is active THEN the system SHALL disable the resend button
4. WHEN the countdown reaches zero THEN the system SHALL enable the resend button

### Requirement 5

**User Story:** As the system, I want to validate password requirements, so that users create secure passwords.

#### Acceptance Criteria

1. WHEN a user enters a password shorter than 6 characters THEN the system SHALL display a validation error
2. WHEN password and confirm password fields do not match THEN the system SHALL display a mismatch error
3. WHEN both passwords match and meet requirements THEN the system SHALL enable the submit button
4. WHEN a user submits the reset password form THEN the system SHALL validate all fields before sending to backend
