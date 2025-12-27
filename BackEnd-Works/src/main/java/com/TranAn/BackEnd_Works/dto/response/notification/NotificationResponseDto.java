package com.TranAn.BackEnd_Works.dto.response.notification;

import com.TranAn.BackEnd_Works.model.constant.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationResponseDto {
    private Long id;
    private String title;
    private String message;
    private NotificationType type;
    private Boolean isRead;
    private String actionUrl;
    private Long referenceId;
    private Instant createdAt;

    // Thông tin người gửi (nếu có)
    private SenderInfo sender;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SenderInfo {
        private Long id;
        private String name;
        private String logoUrl;
    }
}
