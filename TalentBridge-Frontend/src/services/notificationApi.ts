import axiosClient from "@/lib/axiosClient";
import type { ApiResponse, PageResponseDto } from "@/types/apiResponse.d.ts";

// Types
export interface NotificationSender {
    id: number;
    name: string;
    logoUrl?: string;
}

export interface NotificationDto {
    id: number;
    title: string;
    message: string;
    type: "NEW_RESUME" | "RESUME_STATUS_UPDATED" | "NEW_JOB" | "SYSTEM";
    isRead: boolean;
    actionUrl?: string;
    referenceId?: number;
    createdAt: string;
    sender?: NotificationSender;
}

export interface UnreadCountResponse {
    count: number;
}

// API Functions

/**
 * Lấy danh sách thông báo có phân trang
 */
export const getNotifications = (page: number = 1, size: number = 10) => {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    return axiosClient.get<ApiResponse<PageResponseDto<NotificationDto>>>(
        `/notifications?${params.toString()}`
    );
};

/**
 * Lấy top 10 thông báo mới nhất (cho dropdown header)
 */
export const getLatestNotifications = () => {
    return axiosClient.get<ApiResponse<NotificationDto[]>>(
        "/notifications/latest"
    );
};

/**
 * Lấy số lượng thông báo chưa đọc
 */
export const getUnreadCount = () => {
    return axiosClient.get<ApiResponse<UnreadCountResponse>>(
        "/notifications/unread-count"
    );
};

/**
 * Đánh dấu 1 thông báo đã đọc
 */
export const markAsRead = (notificationId: number) => {
    return axiosClient.put<ApiResponse<string>>(
        `/notifications/${notificationId}/read`
    );
};

/**
 * Đánh dấu tất cả thông báo đã đọc
 */
export const markAllAsRead = () => {
    return axiosClient.put<ApiResponse<string>>("/notifications/read-all");
};
