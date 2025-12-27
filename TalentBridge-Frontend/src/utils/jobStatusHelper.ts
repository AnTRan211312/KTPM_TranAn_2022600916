import type { Job, JobStatus } from "@/types/job";

export interface JobStatusResult {
    isExpired: boolean;
    isActive: boolean;
    statusText: string;
    statusColor: string;
}

/**
 * Kiểm tra xem công việc đã hết hạn nộp CV chưa
 * @param endDate - Ngày hết hạn (ISO string)
 * @returns true nếu đã hết hạn, false nếu chưa
 */
export function isJobExpired(endDate: string): boolean {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const jobEndDate = new Date(endDate);
        jobEndDate.setHours(0, 0, 0, 0);

        return today > jobEndDate;
    } catch (error) {
        console.error("Invalid date format:", endDate, error);
        return true; // Treat invalid dates as expired for safety
    }
}

/**
 * Map status to display text
 */
const statusTextMap: Record<JobStatus, string> = {
    ACTIVE: "Đang tuyển",
    EXPIRED: "Hết hạn",
    PAUSED: "Tạm dừng",
    DRAFT: "Nháp",
};

/**
 * Map status to color classes
 */
const statusColorMap: Record<JobStatus, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    EXPIRED: "bg-red-100 text-red-700",
    PAUSED: "bg-yellow-100 text-yellow-700",
    DRAFT: "bg-gray-100 text-gray-700",
};

/**
 * Lấy trạng thái đầy đủ của công việc
 * @param job - Đối tượng công việc
 * @returns Thông tin trạng thái bao gồm text và màu sắc
 */
export function getJobStatus(job: Job): JobStatusResult {
    const status = job.status || "ACTIVE";

    return {
        isExpired: status === "EXPIRED",
        isActive: status === "ACTIVE",
        statusText: statusTextMap[status] || status,
        statusColor: statusColorMap[status] || "bg-gray-100 text-gray-700",
    };
}

