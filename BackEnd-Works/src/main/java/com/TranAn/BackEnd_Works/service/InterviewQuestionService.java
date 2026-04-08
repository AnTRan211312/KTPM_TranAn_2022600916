package com.TranAn.BackEnd_Works.service;

import reactor.core.publisher.Flux;

/**
 * Service để tạo bộ câu hỏi phỏng vấn dựa trên thông tin công việc sử dụng AI
 */
public interface InterviewQuestionService {

    /**
     * Tạo câu hỏi phỏng vấn cho vị trí công việc với SSE streaming
     */
    Flux<String> generateInterviewQuestions(Long jobId);
}
