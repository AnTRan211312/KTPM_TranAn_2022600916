package com.TranAn.BackEnd_Works.controller;

import com.TranAn.BackEnd_Works.annotation.ApiMessage;
import com.TranAn.BackEnd_Works.dto.response.PageResponseDto;
import com.TranAn.BackEnd_Works.dto.response.notification.NotificationResponseDto;
import com.TranAn.BackEnd_Works.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Notification", description = "API quản lý thông báo in-app")
@RestController
@RequiredArgsConstructor
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @ApiMessage("Lấy danh sách thông báo thành công")
    @PreAuthorize("hasAuthority('GET /notifications')")
    @Operation(summary = "Lấy danh sách thông báo (có phân trang)", description = "Yêu cầu quyền: <b>GET /notifications</b>")
    public ResponseEntity<?> getNotifications(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<NotificationResponseDto> pageResult = notificationService.getNotifications(pageable);

        PageResponseDto<NotificationResponseDto> res = new PageResponseDto<>(
                pageResult.getContent(),
                pageable.getPageNumber() + 1,
                pageable.getPageSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages());

        return ResponseEntity.ok(res);
    }

    @GetMapping("/latest")
    @ApiMessage("Lấy thông báo mới nhất thành công")
    @PreAuthorize("hasAuthority('GET /notifications/latest')")
    @Operation(summary = "Lấy top 10 thông báo mới nhất (cho dropdown)", description = "Yêu cầu quyền: <b>GET /notifications/latest</b>")
    public ResponseEntity<?> getLatestNotifications() {
        List<NotificationResponseDto> notifications = notificationService.getLatestNotifications();
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    @ApiMessage("Lấy số thông báo chưa đọc thành công")
    @PreAuthorize("hasAuthority('GET /notifications/unread-count')")
    @Operation(summary = "Lấy số lượng thông báo chưa đọc", description = "Yêu cầu quyền: <b>GET /notifications/unread-count</b>")
    public ResponseEntity<?> getUnreadCount() {
        Long count = notificationService.getUnreadCount();
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/{id}/read")
    @ApiMessage("Đã đánh dấu đã đọc")
    @PreAuthorize("hasAuthority('PUT /notifications/{id}/read')")
    @Operation(summary = "Đánh dấu 1 thông báo đã đọc", description = "Yêu cầu quyền: <b>PUT /notifications/{id}/read</b>")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok("OK");
    }

    @PutMapping("/read-all")
    @ApiMessage("Đã đánh dấu tất cả đã đọc")
    @PreAuthorize("hasAuthority('PUT /notifications/read-all')")
    @Operation(summary = "Đánh dấu tất cả thông báo đã đọc", description = "Yêu cầu quyền: <b>PUT /notifications/read-all</b>")
    public ResponseEntity<?> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok("OK");
    }
}
