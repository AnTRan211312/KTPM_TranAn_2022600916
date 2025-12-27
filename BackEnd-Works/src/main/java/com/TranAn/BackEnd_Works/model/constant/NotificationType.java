package com.TranAn.BackEnd_Works.model.constant;

public enum NotificationType {
    // Cho Recruiter/Admin
    NEW_RESUME, // Có CV mới được nộp
    // Cho User (ứng viên)
    RESUME_STATUS_UPDATED, // Trạng thái CV được cập nhật
    // Chung
    NEW_JOB, // Có việc làm mới phù hợp
    SYSTEM // Thông báo hệ thống
}
