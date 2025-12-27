import { useState, useEffect, useCallback } from "react";
import { Bell, CheckCheck, FileText, Briefcase, Info, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import {
    getLatestNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    type NotificationDto,
} from "@/services/notificationApi";

// Format relative time
const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
};

// Get icon and colors by notification type
const getNotificationStyle = (type: NotificationDto["type"]) => {
    switch (type) {
        case "NEW_RESUME":
            return {
                icon: <FileText className="h-5 w-5" />,
                bgColor: "bg-gradient-to-br from-blue-500 to-blue-600",
                textColor: "text-white",
                label: "CV mới",
                labelColor: "bg-blue-100 text-blue-700",
            };
        case "RESUME_STATUS_UPDATED":
            return {
                icon: <Sparkles className="h-5 w-5" />,
                bgColor: "bg-gradient-to-br from-green-500 to-emerald-600",
                textColor: "text-white",
                label: "Cập nhật",
                labelColor: "bg-green-100 text-green-700",
            };
        case "NEW_JOB":
            return {
                icon: <Briefcase className="h-5 w-5" />,
                bgColor: "bg-gradient-to-br from-purple-500 to-purple-600",
                textColor: "text-white",
                label: "Việc mới",
                labelColor: "bg-purple-100 text-purple-700",
            };
        default:
            return {
                icon: <Info className="h-5 w-5" />,
                bgColor: "bg-gradient-to-br from-gray-400 to-gray-500",
                textColor: "text-white",
                label: "Thông báo",
                labelColor: "bg-gray-100 text-gray-700",
            };
    }
};

interface NotificationBellProps {
    className?: string;
    darkTheme?: boolean;
}

export function NotificationBell({ className, darkTheme = false }: NotificationBellProps) {
    const [notifications, setNotifications] = useState<NotificationDto[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        try {
            const [notifRes, countRes] = await Promise.all([
                getLatestNotifications(),
                getUnreadCount(),
            ]);
            setNotifications(notifRes.data.data || []);
            setUnreadCount(countRes.data.data?.count || 0);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    }, []);

    // Fetch on mount and periodically
    useEffect(() => {
        fetchNotifications();

        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Handle click on notification
    const handleNotificationClick = async (notification: NotificationDto) => {
        setIsLoading(true);
        try {
            if (!notification.isRead) {
                await markAsRead(notification.id);
                setUnreadCount((prev) => Math.max(0, prev - 1));
                setNotifications((prev) =>
                    prev.map((n) =>
                        n.id === notification.id ? { ...n, isRead: true } : n
                    )
                );
            }

            if (notification.actionUrl) {
                navigate(notification.actionUrl);
                setIsOpen(false);
            }
        } catch (error) {
            console.error("Failed to mark as read:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle mark all as read
    const handleMarkAllAsRead = async () => {
        setIsLoading(true);
        try {
            await markAllAsRead();
            setUnreadCount(0);
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true }))
            );
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`relative ${darkTheme
                        ? "text-gray-700 hover:bg-gray-100"
                        : "text-white hover:bg-white/20"
                        } ${className}`}
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-white">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-96 overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-2xl"
            >
                {/* Header với gradient */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-white" />
                            <h3 className="font-bold text-white">Thông báo</h3>
                            {unreadCount > 0 && (
                                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white">
                                    {unreadCount} mới
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleMarkAllAsRead}
                                disabled={isLoading}
                                className="h-7 px-2 text-xs text-white/90 hover:bg-white/20 hover:text-white"
                            >
                                <CheckCheck className="mr-1 h-3.5 w-3.5" />
                                Đọc tất cả
                            </Button>
                        )}
                    </div>
                </div>

                {/* Notification list */}
                <div className="max-h-[420px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <div className="mb-3 rounded-full bg-gray-100 p-4">
                                <Bell className="h-8 w-8 text-gray-300" />
                            </div>
                            <p className="font-medium text-gray-500">Chưa có thông báo</p>
                            <p className="mt-1 text-xs text-gray-400">Thông báo mới sẽ xuất hiện ở đây</p>
                        </div>
                    ) : (
                        notifications.map((notification, index) => {
                            const style = getNotificationStyle(notification.type);
                            return (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`group relative flex cursor-pointer gap-4 px-5 py-4 transition-all duration-200 hover:bg-gray-50 ${!notification.isRead
                                        ? "bg-gradient-to-r from-orange-50/80 to-transparent"
                                        : ""
                                        } ${index !== notifications.length - 1 ? "border-b border-gray-100" : ""}`}
                                >
                                    {/* Icon với gradient background */}
                                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${style.bgColor} ${style.textColor} shadow-lg`}>
                                        {style.icon}
                                    </div>

                                    {/* Content */}
                                    <div className="min-w-0 flex-1 pr-6">
                                        {/* Label badge */}
                                        <div className="mb-1.5 flex items-center gap-2">
                                            <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${style.labelColor}`}>
                                                {style.label}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {formatRelativeTime(notification.createdAt)}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <p className={`text-sm leading-snug ${!notification.isRead
                                            ? "font-semibold text-gray-900"
                                            : "font-medium text-gray-700"
                                            }`}>
                                            {notification.title}
                                        </p>

                                        {/* Message với user info */}
                                        <div className="mt-1.5 flex items-center gap-2">
                                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300 ring-2 ring-blue-400">
                                                <User className="h-3 w-3 text-gray-500" />
                                            </div>
                                            <p className="line-clamp-1 text-xs text-gray-500">
                                                {notification.message}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Unread indicator - dot */}
                                    {!notification.isRead && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <div className="h-2.5 w-2.5 rounded-full bg-orange-500 ring-4 ring-orange-100" />
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-3">
                        <p className="text-center text-xs text-gray-400">
                            Hiển thị {notifications.length} thông báo gần nhất
                        </p>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default NotificationBell;
