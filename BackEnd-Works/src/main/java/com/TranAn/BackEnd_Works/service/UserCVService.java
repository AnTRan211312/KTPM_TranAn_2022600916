package com.TranAn.BackEnd_Works.service;

import com.TranAn.BackEnd_Works.dto.request.usercv.CreateUserCVRequestDto;
import com.TranAn.BackEnd_Works.dto.request.usercv.UpdateUserCVRequestDto;
import com.TranAn.BackEnd_Works.dto.response.usercv.UserCVResponseDto;
import com.TranAn.BackEnd_Works.dto.response.usercv.UserCVSummaryDto;
import reactor.core.publisher.Flux;

import java.util.List;

public interface UserCVService {

    UserCVResponseDto createCV(CreateUserCVRequestDto request);

    UserCVResponseDto updateCV(UpdateUserCVRequestDto request);

    List<UserCVSummaryDto> getMyCVs();

    UserCVResponseDto getCVById(Long id);

    void deleteCV(Long id);

    UserCVResponseDto setDefaultCV(Long id);

    long countMyCVs();

    /**
     * Gợi ý nội dung CV với SSE streaming
     */
    Flux<String> generateAiSuggestion(String cvData);
}
