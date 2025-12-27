package com.TranAn.BackEnd_Works.service.impl;

import com.TranAn.BackEnd_Works.dto.response.notification.NotificationResponseDto;
import com.TranAn.BackEnd_Works.model.Notification;
import com.TranAn.BackEnd_Works.model.User;
import com.TranAn.BackEnd_Works.model.constant.NotificationType;
import com.TranAn.BackEnd_Works.repository.NotificationRepository;
import com.TranAn.BackEnd_Works.repository.UserRepository;
import com.TranAn.BackEnd_Works.service.NotificationService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    public void createNotification(User recipient, User sender, String title, String message,
            NotificationType type, String actionUrl, Long referenceId) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .sender(sender)
                .title(title)
                .message(message)
                .type(type)
                .actionUrl(actionUrl)
                .referenceId(referenceId)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
        log.info("Created notification for user {}: {}", recipient.getEmail(), title);
    }

    @Override
    public void createNotificationForUsers(List<User> recipients, User sender, String title, String message,
            NotificationType type, String actionUrl, Long referenceId) {
        List<Notification> notifications = recipients.stream()
                .map(recipient -> Notification.builder()
                        .recipient(recipient)
                        .sender(sender)
                        .title(title)
                        .message(message)
                        .type(type)
                        .actionUrl(actionUrl)
                        .referenceId(referenceId)
                        .isRead(false)
                        .build())
                .collect(Collectors.toList());

        notificationRepository.saveAll(notifications);
        log.info("Created {} notifications for title: {}", recipients.size(), title);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponseDto> getNotifications(Pageable pageable) {
        User currentUser = getCurrentUser();
        return notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(currentUser.getId(), pageable)
                .map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponseDto> getLatestNotifications() {
        User currentUser = getCurrentUser();
        return notificationRepository
                .findTop10ByRecipientIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Long getUnreadCount() {
        User currentUser = getCurrentUser();
        return notificationRepository.countByRecipientIdAndIsReadFalse(currentUser.getId());
    }

    @Override
    public void markAsRead(Long notificationId) {
        User currentUser = getCurrentUser();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông báo"));

        // Kiểm tra quyền sở hữu
        if (!notification.getRecipient().getId().equals(currentUser.getId())) {
            throw new SecurityException("Bạn không có quyền truy cập thông báo này");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    public void markAllAsRead() {
        User currentUser = getCurrentUser();
        int updated = notificationRepository.markAllAsReadByRecipientId(currentUser.getId());
        log.info("Marked {} notifications as read for user {}", updated, currentUser.getEmail());
    }

    // ==== HELPER: Gửi thông báo cho các use case cụ thể ====

    @Override
    public void notifyNewResume(Long resumeId, Long jobId, Long companyId, Long applicantId, String applicantName,
            String jobName) {
        // Tìm tất cả recruiter thuộc company này
        List<User> recruiters = userRepository.findByCompanyId(companyId);

        // Tìm tất cả admin
        List<User> admins = userRepository.findByRole_Name("ADMIN");

        // Gộp danh sách và loại bỏ trùng lặp
        java.util.Set<User> recipients = new java.util.HashSet<>();
        recipients.addAll(recruiters);
        recipients.addAll(admins);

        if (recipients.isEmpty()) {
            log.warn("No recruiters or admins found for company {} to notify", companyId);
            return;
        }

        // Fetch sender (applicant)
        User sender = null;
        if (applicantId != null) {
            sender = userRepository.findById(applicantId).orElse(null);
        }

        String title = "📄 CV mới: " + jobName;
        String message = applicantName + " vừa nộp CV ứng tuyển vị trí " + jobName;
        String actionUrl = "/admin/resume";

        createNotificationForUsers(new java.util.ArrayList<>(recipients), sender, title, message,
                NotificationType.NEW_RESUME, actionUrl, resumeId);

        log.info("Sent NEW_RESUME notification to {} recruiters and {} admins",
                recruiters.size(), admins.size());
    }

    @Override
    public void notifyResumeStatusUpdated(Long resumeId, Long applicantId, Long actorId, String jobName,
            String companyName,
            String newStatus) {
        User applicant = userRepository.findById(applicantId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy ứng viên"));

        // Fetch sender (actor who updated status)
        User sender = null;
        if (actorId != null) {
            sender = userRepository.findById(actorId).orElse(null);
        }

        String statusText = mapStatusToVietnamese(newStatus);
        String title = "📋 Cập nhật trạng thái CV";
        String message = "CV ứng tuyển vị trí " + jobName + " tại " + companyName + " đã được cập nhật: " + statusText;
        String actionUrl = "/user/resumes";

        createNotification(applicant, sender, title, message,
                NotificationType.RESUME_STATUS_UPDATED, actionUrl, resumeId);
    }

    // ==== PRIVATE METHODS ====

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));
    }

    private NotificationResponseDto mapToDto(Notification notification) {
        NotificationResponseDto.SenderInfo senderInfo = null;
        if (notification.getSender() != null) {
            String logoUrl = notification.getSender().getLogoUrl();

            // Nếu người gửi thuộc công ty, ưu tiên hiển thị logo công ty
            if (notification.getSender().getCompany() != null &&
                    notification.getSender().getCompany().getCompanyLogo() != null) {
                logoUrl = notification.getSender().getCompany().getCompanyLogo().getLogoUrl();
            }

            senderInfo = NotificationResponseDto.SenderInfo.builder()
                    .id(notification.getSender().getId())
                    .name(notification.getSender().getName())
                    .logoUrl(logoUrl)
                    .build();
        }

        return NotificationResponseDto.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .isRead(notification.getIsRead())
                .actionUrl(notification.getActionUrl())
                .referenceId(notification.getReferenceId())
                .createdAt(notification.getCreatedAt())
                .sender(senderInfo)
                .build();
    }

    private String mapStatusToVietnamese(String status) {
        return switch (status) {
            case "PENDING" -> "Đang chờ xử lý";
            case "REVIEWING" -> "Đang xem xét";
            case "APPROVED" -> "Đã được duyệt";
            case "REJECTED" -> "Không phù hợp";
            default -> status;
        };
    }
}
