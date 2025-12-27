package com.TranAn.BackEnd_Works.model.constant;

/**
 * Trạng thái của công việc tuyển dụng
 */
public enum JobStatus {
    /**
     * Đang tuyển - công việc đang hoạt động
     */
    ACTIVE,

    /**
     * Đã hết hạn - công việc quá ngày kết thúc
     */
    EXPIRED,

    /**
     * Tạm dừng - nhà tuyển dụng tự ẩn công việc
     */
    PAUSED,

    /**
     * Nháp - công việc chưa được công khai
     */
    DRAFT
}
