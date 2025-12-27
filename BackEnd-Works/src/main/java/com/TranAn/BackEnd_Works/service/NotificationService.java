package com.TranAn.BackEnd_Works.service;

import com.TranAn.BackEnd_Works.dto.response.notification.NotificationResponseDto;
import com.TranAn.BackEnd_Works.model.User;
import com.TranAn.BackEnd_Works.model.constant.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {

    // Tạo thông báo mới
    void createNotification(User recipient, User sender, String title, String message,
            NotificationType type, String actionUrl, Long referenceId);

    // Tạo thông báo cho nhiều người (dùng khi có CV mới gửi cho tất cả recruiter
    // của company)
    void createNotificationForUsers(List<User> recipients, User sender, String title, String message,
            NotificationType type, String actionUrl, Long referenceId);

    // Lấy danh sách thông báo của user hiện tại
    Page<NotificationResponseDto> getNotifications(Pageable pageable);

    // Lấy top N thông báo mới nhất (cho dropdown header)
    List<NotificationResponseDto> getLatestNotifications();

    // Lấy số lượng thông báo chưa đọc
    Long getUnreadCount();

    // Đánh dấu 1 thông báo đã đọc
    void markAsRead(Long notificationId);

    // Đánh dấu tất cả thông báo đã đọc
    void markAllAsRead();

    // ==== HELPER: Gửi thông báo cho các use case cụ thể ====

    // Thông báo khi có CV mới được nộp (gửi cho recruiter của company)
    void notifyNewResume(Long resumeId, Long jobId, Long companyId, Long applicantId, String applicantName,
            String jobName);

    // Thông báo khi trạng thái CV được cập nhật (gửi cho ứng viên)
    void notifyResumeStatusUpdated(Long resumeId, Long applicantId, Long actorId, String jobName, String companyName,
            String newStatus);
}
