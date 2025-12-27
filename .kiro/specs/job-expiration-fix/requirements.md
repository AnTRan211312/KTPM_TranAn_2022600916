# Requirements Document

## Introduction

Hiện tại hệ thống có lỗi hiển thị trạng thái công việc: các công việc đã hết hạn nộp CV vẫn hiển thị là "Đang tuyển" với màu xanh, và người dùng vẫn có thể cố gắng nộp CV cho các công việc này. Tính năng này sẽ sửa lỗi hiển thị trạng thái công việc dựa trên ngày hết hạn và ngăn chặn việc nộp CV cho công việc đã hết hạn.

## Glossary

- **Job**: Công việc/vị trí tuyển dụng trong hệ thống
- **EndDate**: Ngày hết hạn nộp CV cho công việc
- **Active**: Trạng thái kích hoạt của công việc (do admin/recruiter thiết lập)
- **JobGrid**: Component hiển thị danh sách công việc dạng lưới
- **ApplySection**: Component cho phép người dùng nộp CV
- **System**: Hệ thống TalentBridge

## Requirements

### Requirement 1

**User Story:** Là người dùng, tôi muốn thấy trạng thái chính xác của công việc dựa trên ngày hết hạn, để tôi biết công việc nào còn có thể nộp CV.

#### Acceptance Criteria

1. WHEN the System displays a job THEN the System SHALL check if the current date is after the job's endDate
2. WHEN a job's endDate has passed THEN the System SHALL display the job status as "Hết hạn" with red background color
3. WHEN a job's endDate has not passed AND the job's active field is true THEN the System SHALL display the job status as "Đang tuyển" with green background color
4. WHEN a job's active field is false THEN the System SHALL display the job status as "Đã đóng" with red background color regardless of endDate

### Requirement 2

**User Story:** Là người dùng, tôi muốn bị ngăn chặn nộp CV cho công việc đã hết hạn, để tránh lãng phí thời gian nộp CV vô ích.

#### Acceptance Criteria

1. WHEN a user attempts to open the apply modal for an expired job THEN the System SHALL prevent the modal from opening
2. WHEN a user attempts to open the apply modal for an expired job THEN the System SHALL display an error message "Công việc này đã hết hạn nộp CV"
3. WHEN a job is expired THEN the System SHALL hide or disable the apply buttons on the job details page
4. WHEN a job is not expired AND the user is logged in THEN the System SHALL allow the user to open the apply modal

### Requirement 3

**User Story:** Là developer, tôi muốn có một utility function để kiểm tra trạng thái công việc, để đảm bảo logic nhất quán trong toàn bộ ứng dụng.

#### Acceptance Criteria

1. WHEN the System needs to determine job status THEN the System SHALL use a centralized utility function
2. WHEN the utility function receives a job object THEN the System SHALL return an object containing isExpired boolean and status text
3. WHEN the utility function calculates expiration THEN the System SHALL compare the current date with the job's endDate at day precision
4. WHEN multiple components need job status THEN the System SHALL use the same utility function to ensure consistency
