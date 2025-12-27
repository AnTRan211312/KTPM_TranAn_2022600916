package com.TranAn.BackEnd_Works.model;

import com.TranAn.BackEnd_Works.model.common.BaseEntity;
import com.TranAn.BackEnd_Works.model.constant.NotificationType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notifications")
@AllArgsConstructor
@NoArgsConstructor
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@Builder
public class Notification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    // Tiêu đề thông báo
    @Column(nullable = false)
    private String title;

    // Nội dung thông báo
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    // Loại thông báo: NEW_RESUME, RESUME_STATUS_UPDATED, NEW_JOB, etc.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    // Đã đọc chưa
    @Column(nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    // Link để điều hướng khi click vào thông báo
    private String actionUrl;

    // ID của entity liên quan (resumeId, jobId, etc.)
    private Long referenceId;

    // Người nhận thông báo
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    @ToString.Exclude
    private User recipient;

    // Người gửi/tạo thông báo (có thể null nếu là system notification)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    @ToString.Exclude
    private User sender;
}
