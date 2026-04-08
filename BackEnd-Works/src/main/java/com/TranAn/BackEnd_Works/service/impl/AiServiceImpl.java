package com.TranAn.BackEnd_Works.service.impl;

import com.TranAn.BackEnd_Works.service.AiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiServiceImpl implements AiService {

    private final ChatClient chatClient;

    @Override
    public Flux<String> generateContent(String prompt) {
        log.info("Starting AI content stream generation");
        return chatClient.prompt()
                .user(prompt)
                .stream()
                .content()
                .doOnError(e -> log.error("AI streaming error: {}", e.getMessage()));
    }
}
