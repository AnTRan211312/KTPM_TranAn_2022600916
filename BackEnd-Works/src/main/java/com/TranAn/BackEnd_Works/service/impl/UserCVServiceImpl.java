package com.TranAn.BackEnd_Works.service.impl;

import com.TranAn.BackEnd_Works.dto.request.usercv.CreateUserCVRequestDto;
import com.TranAn.BackEnd_Works.dto.request.usercv.UpdateUserCVRequestDto;
import com.TranAn.BackEnd_Works.dto.response.usercv.UserCVResponseDto;
import com.TranAn.BackEnd_Works.dto.response.usercv.UserCVSummaryDto;
import com.TranAn.BackEnd_Works.model.User;
import com.TranAn.BackEnd_Works.model.UserCV;
import com.TranAn.BackEnd_Works.repository.UserCVRepository;
import com.TranAn.BackEnd_Works.repository.UserRepository;
import com.TranAn.BackEnd_Works.service.UserCVService;
import com.TranAn.BackEnd_Works.service.AiService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class UserCVServiceImpl implements UserCVService {

    private final UserCVRepository userCVRepository;
    private final UserRepository userRepository;
    private final AiService aiService;

    private static final String CV_SUGGESTION_PROMPT = "Dưới đây là dữ liệu JSON hiện tại của một CV: \n%s\n\n" +
            "Nhiệm vụ của bạn là tối ưu hóa nội dung CV này để trở nên chuyên nghiệp hơn. " +
            "Hãy cải thiện phần 'summary', 'experience description' và bổ sung các kỹ năng phù hợp nếu cần. " +
            "QUAN TRỌNG: Chỉ trả về nội dung là chuỗi JSON hợp lệ với cấu trúc chuẩn giống như đầu vào. " +
            "Không bao gồm bất kỳ lời giải thích nào khác ngoài chuỗi JSON.";

    @Override
    public Flux<String> generateAiSuggestion(String cvData) {
        String prompt = String.format(CV_SUGGESTION_PROMPT, cvData);
        return aiService.generateContent(prompt);
    }

    @Override
    public UserCVResponseDto createCV(CreateUserCVRequestDto request) {
        User currentUser = getCurrentUser();

        UserCV userCV = UserCV.builder()
                .name(request.getName())
                .templateId(request.getTemplateId())
                .cvData(request.getCvData())
                .user(currentUser)
                .isDefault(false)
                .build();

        // Nếu đây là CV đầu tiên, set làm default
        if (userCVRepository.countByUserId(currentUser.getId()) == 0) {
            userCV.setIsDefault(true);
        }

        UserCV savedCV = userCVRepository.save(userCV);
        return mapToResponseDto(savedCV);
    }

    @Override
    public UserCVResponseDto updateCV(UpdateUserCVRequestDto request) {
        User currentUser = getCurrentUser();

        UserCV userCV = userCVRepository.findByIdAndUserId(request.getId(), currentUser.getId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy CV"));

        userCV.setName(request.getName());
        userCV.setTemplateId(request.getTemplateId());
        userCV.setCvData(request.getCvData());

        UserCV savedCV = userCVRepository.save(userCV);
        return mapToResponseDto(savedCV);
    }

    @Override
    public List<UserCVSummaryDto> getMyCVs() {
        User currentUser = getCurrentUser();

        return userCVRepository.findByUserIdOrderByUpdatedAtDesc(currentUser.getId())
                .stream()
                .map(this::mapToSummaryDto)
                .toList();
    }

    @Override
    public UserCVResponseDto getCVById(Long id) {
        User currentUser = getCurrentUser();

        UserCV userCV = userCVRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy CV"));

        return mapToResponseDto(userCV);
    }

    @Override
    public void deleteCV(Long id) {
        User currentUser = getCurrentUser();

        UserCV userCV = userCVRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy CV"));

        boolean wasDefault = Boolean.TRUE.equals(userCV.getIsDefault());

        userCVRepository.delete(userCV);

        // Nếu CV bị xóa là default, set CV khác làm default
        if (wasDefault) {
            List<UserCV> remainingCVs = userCVRepository.findByUserIdOrderByUpdatedAtDesc(currentUser.getId());
            if (!remainingCVs.isEmpty()) {
                UserCV newDefault = remainingCVs.get(0);
                newDefault.setIsDefault(true);
                userCVRepository.save(newDefault);
            }
        }
    }

    @Override
    public UserCVResponseDto setDefaultCV(Long id) {
        User currentUser = getCurrentUser();

        UserCV userCV = userCVRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy CV"));

        // Bỏ default CV cũ
        userCVRepository.findByUserIdAndIsDefaultTrue(currentUser.getId())
                .ifPresent(oldDefault -> {
                    oldDefault.setIsDefault(false);
                    userCVRepository.save(oldDefault);
                });

        // Set CV mới làm default
        userCV.setIsDefault(true);
        UserCV savedCV = userCVRepository.save(userCV);

        return mapToResponseDto(savedCV);
    }

    @Override
    public long countMyCVs() {
        User currentUser = getCurrentUser();
        return userCVRepository.countByUserId(currentUser.getId());
    }

    // ================================
    // Helper methods
    // ================================

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));
    }

    private UserCVResponseDto mapToResponseDto(UserCV userCV) {
        return UserCVResponseDto.builder()
                .id(userCV.getId())
                .name(userCV.getName())
                .templateId(userCV.getTemplateId())
                .cvData(userCV.getCvData())
                .isDefault(userCV.getIsDefault())
                .createdAt(userCV.getCreatedAt())
                .updatedAt(userCV.getUpdatedAt())
                .build();
    }

    private UserCVSummaryDto mapToSummaryDto(UserCV userCV) {
        return UserCVSummaryDto.builder()
                .id(userCV.getId())
                .name(userCV.getName())
                .templateId(userCV.getTemplateId())
                .isDefault(userCV.getIsDefault())
                .createdAt(userCV.getCreatedAt())
                .updatedAt(userCV.getUpdatedAt())
                .build();
    }
}
