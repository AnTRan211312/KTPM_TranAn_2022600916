package com.TranAn.BackEnd_Works.service.impl;

import com.TranAn.BackEnd_Works.model.Job;
import com.TranAn.BackEnd_Works.model.Skill;
import com.TranAn.BackEnd_Works.repository.JobRepository;
import com.TranAn.BackEnd_Works.service.InterviewQuestionService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewQuestionServiceImpl implements InterviewQuestionService {

    private final ChatClient chatClient;
    private final JobRepository jobRepository;

    private static final String INTERVIEW_QUESTIONS_PROMPT = """
            Bạn là chuyên gia tuyển dụng IT với nhiều năm kinh nghiệm phỏng vấn. Hãy tạo bộ câu hỏi phỏng vấn chi tiết cho vị trí công việc sau:

            **VỊ TRÍ TUYỂN DỤNG:**
            - Tên công việc: %s
            - Công ty: %s
            - Cấp bậc: %s
            - Kỹ năng yêu cầu: %s
            - Mô tả công việc: %s

            **YÊU CẦU QUAN TRỌNG VỀ FORMAT:**
            - PHẢI xuống dòng giữa mỗi câu hỏi và phần gợi ý trả lời
            - Mỗi câu hỏi dùng format: số thứ tự + câu hỏi in đậm
            - Sau câu hỏi PHẢI có 1 dòng trống, rồi mới đến "**Gợi ý trả lời:**" trên dòng riêng biệt
            - Sau phần gợi ý trả lời PHẢI có 1 dòng trống trước câu hỏi tiếp theo
            - TUYỆT ĐỐI KHÔNG viết câu hỏi và gợi ý trả lời trên cùng một dòng

            **FORMAT MẪU (BẮT BUỘC THEO ĐÚNG):**

            ## 🎯 Câu hỏi Kỹ thuật

            **1. Nội dung câu hỏi ở đây?**

            **Gợi ý trả lời:** Nội dung gợi ý trả lời chi tiết ở đây. Có thể viết nhiều dòng.

            **2. Câu hỏi tiếp theo?**

            **Gợi ý trả lời:** Nội dung trả lời.

            ---

            **NỘI DUNG CẦN TẠO:**

            ## 🎯 Câu hỏi Kỹ thuật (5-7 câu)
            Dựa trên các kỹ năng yêu cầu (%s), tạo câu hỏi kỹ thuật chuyên sâu.

            ## 💡 Câu hỏi Tình huống & Behavioral (3-4 câu)
            Câu hỏi đánh giá kỹ năng mềm, xử lý tình huống phù hợp cấp bậc %s.

            ## 📋 Câu hỏi về Kinh nghiệm & Dự án (2-3 câu)
            Câu hỏi về kinh nghiệm thực tế, dự án đã làm.

            ## 💬 Câu hỏi Ứng viên nên hỏi Nhà tuyển dụng (2-3 câu)
            Gợi ý câu hỏi thông minh cho ứng viên.

            **LƯU Ý:**
            - BẮT BUỘC xuống dòng rõ ràng giữa câu hỏi và gợi ý trả lời
            - Câu hỏi phải sát thực tế vị trí tuyển dụng
            - Viết bằng tiếng Việt
            """;

    @Override
    public Flux<String> generateInterviewQuestions(Long jobId) {
        log.info("Generating interview questions for job ID: {}", jobId);

        return Flux.concat(
                Mono.just("{\"phase\":\"LOADING\",\"message\":\"Đang tải thông tin công việc...\"}"),

                Mono.fromCallable(() -> {
                    Job job = jobRepository.findById(jobId)
                            .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy công việc với ID: " + jobId));
                    return buildPrompt(job);
                }).flatMapMany(prompt -> Flux.concat(
                        Mono.just("{\"phase\":\"GENERATING\",\"message\":\"AI đang tạo câu hỏi phỏng vấn...\"}"),
                        chatClient.prompt().user(prompt).stream().content())),

                Mono.just("{\"phase\":\"COMPLETE\",\"message\":\"Hoàn tất!\"}"))
                .doOnError(e -> log.error("Error generating interview questions for job {}: {}", jobId, e.getMessage()));
    }

    private String buildPrompt(Job job) {
        String skills = job.getSkills() != null
                ? job.getSkills().stream().map(Skill::getName).collect(Collectors.joining(", "))
                : "Không có yêu cầu cụ thể";

        String level = job.getLevel() != null ? job.getLevel().name() : "Không xác định";
        String companyName = job.getCompany() != null ? job.getCompany().getName() : "Không xác định";
        String description = job.getDescription() != null ? job.getDescription() : "Không có mô tả";

        // Strip HTML tags from description
        description = description.replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim();

        // Truncate if too long
        if (description.length() > 2000) {
            description = description.substring(0, 2000) + "...";
        }

        return String.format(INTERVIEW_QUESTIONS_PROMPT,
                job.getName(),
                companyName,
                level,
                skills,
                description,
                skills,
                level);
    }
}
