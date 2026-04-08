package com.TranAn.BackEnd_Works.service;

import reactor.core.publisher.Flux;

public interface AiService {
    /**
     * Generate AI content with SSE streaming
     */
    Flux<String> generateContent(String prompt);
}
