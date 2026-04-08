package com.TranAn.BackEnd_Works.service;

import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;

/**
 * Service để phân tích CV sử dụng AI và đánh giá độ phù hợp với công việc
 */
public interface CVAnalysisService {

    /**
     * Phân tích CV với SSE streaming (hiển thị progress)
     */
    Flux<String> analyzeResume(Long resumeId);

    /**
     * Phân tích CV preview (trước khi nộp đơn) - blocking vì cần upload file
     */
    Flux<String> analyzeResumePreview(MultipartFile cvFile, Long jobId);

    /**
     * Phân tích CV đã nộp trước đó so với một công việc cụ thể (dành cho User)
     */
    Flux<String> analyzeExistingResumeForJob(Long resumeId, Long jobId);
}
