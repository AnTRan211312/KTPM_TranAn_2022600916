package com.TranAn.BackEnd_Works.service;

import com.TranAn.BackEnd_Works.dto.response.resume.CVAnalysisResponseDto;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service để phân tích CV sử dụng AI và đánh giá độ phù hợp với công việc
 */
public interface CVAnalysisService {

    /**
     * Phân tích CV đã được nộp (từ Resume đã lưu trong database)
     * 
     * @param resumeId ID của resume đã nộp
     * @return Kết quả phân tích CV
     */
    CVAnalysisResponseDto analyzeResume(Long resumeId);

    /**
     * Phân tích CV preview (trước khi nộp đơn)
     * 
     * @param cvFile File PDF CV của ứng viên
     * @param jobId  ID của công việc muốn ứng tuyển
     * @return Kết quả phân tích CV
     */
    CVAnalysisResponseDto analyzeResumePreview(MultipartFile cvFile, Long jobId);
}
