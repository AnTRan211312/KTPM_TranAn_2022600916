package com.TranAn.BackEnd_Works.dto.response.resume;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVAnalysisResponseDto {

    /**
     * Điểm phù hợp (0-100%)
     */
    private Integer matchScore;

    /**
     * Các điểm mạnh của ứng viên so với yêu cầu công việc
     */
    private List<String> strengths;

    /**
     * Các điểm cần cải thiện hoặc thiếu sót
     */
    private List<String> weaknesses;

    /**
     * Gợi ý cho ứng viên để tăng độ phù hợp
     */
    private List<String> suggestions;

    /**
     * Tóm tắt đánh giá tổng quan
     */
    private String summary;

    /**
     * Tên công việc được so sánh
     */
    private String jobName;

    /**
     * ID của resume (nếu đã lưu)
     */
    private Long resumeId;
}
