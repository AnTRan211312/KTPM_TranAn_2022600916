package com.TranAn.BackEnd_Works.service.impl;

import com.TranAn.BackEnd_Works.dto.response.resume.CVAnalysisResponseDto;
import com.TranAn.BackEnd_Works.model.Job;
import com.TranAn.BackEnd_Works.model.Resume;
import com.TranAn.BackEnd_Works.model.Skill;
import com.TranAn.BackEnd_Works.repository.JobRepository;
import com.TranAn.BackEnd_Works.repository.ResumeRepository;
import com.TranAn.BackEnd_Works.service.CVAnalysisService;
import com.TranAn.BackEnd_Works.service.S3Service;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CVAnalysisServiceImpl implements CVAnalysisService {

    private final ChatClient chatClient;
    private final ResumeRepository resumeRepository;
    private final JobRepository jobRepository;
    private final S3Service s3Service;
    private final ObjectMapper objectMapper;

    private static final String ANALYSIS_PROMPT_TEMPLATE = """
            Bạn là chuyên gia tuyển dụng IT. Hãy phân tích nội dung CV bên dưới và đánh giá độ phù hợp với vị trí công việc:

            **VỊ TRÍ TUYỂN DỤNG:**
            - Tên công việc: %s
            - Cấp bậc: %s
            - Kỹ năng yêu cầu: %s
            - Mô tả công việc: %s

            **NỘI DUNG CV:**
            %s

            **YÊU CẦU:**
            1. Đánh giá độ phù hợp từ 0-100%%
            2. Liệt kê 3-5 điểm mạnh của ứng viên phù hợp với vị trí
            3. Liệt kê 2-4 điểm cần cải thiện hoặc thiếu sót
            4. Đưa ra 2-3 gợi ý để ứng viên tăng cơ hội trúng tuyển
            5. Viết tóm tắt đánh giá ngắn gọn (2-3 câu)

            **QUAN TRỌNG:** Trả lời CHÍNH XÁC theo format JSON sau (không thêm text nào khác):
            ```json
            {
                "matchScore": <số từ 0-100>,
                "strengths": ["điểm mạnh 1", "điểm mạnh 2", ...],
                "weaknesses": ["điểm yếu 1", "điểm yếu 2", ...],
                "suggestions": ["gợi ý 1", "gợi ý 2", ...],
                "summary": "tóm tắt đánh giá"
            }
            ```
            """;

    @Override
    public CVAnalysisResponseDto analyzeResume(Long resumeId) {
        log.info("Analyzing resume with ID: {}", resumeId);

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy resume với ID: " + resumeId));

        Job job = resume.getJob();
        if (job == null) {
            throw new EntityNotFoundException("Resume không liên kết với công việc nào");
        }

        // Generate presigned URL for CV PDF
        String presignedUrl = s3Service.generatePresignedUrl(resume.getFileKey(), Duration.ofMinutes(15));

        // Extract text from PDF
        String pdfText = extractTextFromPdfUrl(presignedUrl);

        // Build prompt and call AI
        String prompt = buildPrompt(job, pdfText);
        String aiResponse = callAI(prompt);

        // Parse response
        CVAnalysisResponseDto result = parseAIResponse(aiResponse);
        result.setJobName(job.getName());
        result.setResumeId(resumeId);

        log.info("CV analysis completed for resume ID: {} with match score: {}%", resumeId, result.getMatchScore());
        return result;
    }

    @Override
    public CVAnalysisResponseDto analyzeResumePreview(MultipartFile cvFile, Long jobId) {
        log.info("Analyzing CV preview for job ID: {}", jobId);

        if (cvFile == null || cvFile.isEmpty()) {
            throw new IllegalArgumentException("File CV không được rỗng");
        }

        if (!"application/pdf".equals(cvFile.getContentType())) {
            throw new IllegalArgumentException("Chỉ hỗ trợ file PDF");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy công việc với ID: " + jobId));

        // Extract text from uploaded PDF directly (no need to upload to S3)
        String pdfText = extractTextFromMultipartFile(cvFile);

        // Build prompt and call AI
        String prompt = buildPrompt(job, pdfText);
        String aiResponse = callAI(prompt);

        // Parse response
        CVAnalysisResponseDto result = parseAIResponse(aiResponse);
        result.setJobName(job.getName());

        log.info("CV preview analysis completed for job ID: {} with match score: {}%", jobId, result.getMatchScore());
        return result;
    }

    /**
     * Extract text from PDF file uploaded as MultipartFile
     */
    private String extractTextFromMultipartFile(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream();
                PDDocument document = Loader.loadPDF(inputStream.readAllBytes())) {

            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);

            // Truncate if too long (AI has token limits)
            if (text.length() > 8000) {
                text = text.substring(0, 8000) + "\n... (CV đã được rút gọn)";
            }

            log.debug("Extracted {} characters from PDF", text.length());
            return text;

        } catch (IOException e) {
            log.error("Error extracting text from PDF", e);
            throw new RuntimeException("Không thể đọc nội dung file PDF: " + e.getMessage(), e);
        }
    }

    /**
     * Extract text from PDF file at URL (presigned S3 URL)
     */
    private String extractTextFromPdfUrl(String pdfUrl) {
        try (InputStream inputStream = new URL(pdfUrl).openStream();
                PDDocument document = Loader.loadPDF(inputStream.readAllBytes())) {

            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);

            // Truncate if too long
            if (text.length() > 8000) {
                text = text.substring(0, 8000) + "\n... (CV đã được rút gọn)";
            }

            log.debug("Extracted {} characters from PDF URL", text.length());
            return text;

        } catch (IOException e) {
            log.error("Error extracting text from PDF URL: {}", pdfUrl, e);
            throw new RuntimeException("Không thể đọc nội dung file PDF từ URL", e);
        }
    }

    private String buildPrompt(Job job, String cvText) {
        String skills = job.getSkills() != null
                ? job.getSkills().stream().map(Skill::getName).collect(Collectors.joining(", "))
                : "Không có yêu cầu cụ thể";

        String level = job.getLevel() != null ? job.getLevel().name() : "Không xác định";
        String description = job.getDescription() != null ? job.getDescription() : "Không có mô tả";

        // Strip HTML tags from description
        description = description.replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim();

        // Truncate if too long
        if (description.length() > 2000) {
            description = description.substring(0, 2000) + "...";
        }

        return String.format(ANALYSIS_PROMPT_TEMPLATE,
                job.getName(),
                level,
                skills,
                description,
                cvText);
    }

    private String callAI(String prompt) {
        try {
            log.debug("Calling AI with prompt length: {} chars", prompt.length());

            String response = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            log.debug("AI response received: {}", response);
            return response;
        } catch (Exception e) {
            log.error("Error calling AI service", e);
            throw new RuntimeException("Lỗi khi gọi AI phân tích CV: " + e.getMessage(), e);
        }
    }

    private CVAnalysisResponseDto parseAIResponse(String response) {
        try {
            // Extract JSON from response (AI might include markdown code blocks)
            String jsonStr = extractJson(response);

            JsonNode root = objectMapper.readTree(jsonStr);

            Integer matchScore = root.has("matchScore") ? root.get("matchScore").asInt() : 50;

            List<String> strengths = new ArrayList<>();
            if (root.has("strengths") && root.get("strengths").isArray()) {
                root.get("strengths").forEach(node -> strengths.add(node.asText()));
            }

            List<String> weaknesses = new ArrayList<>();
            if (root.has("weaknesses") && root.get("weaknesses").isArray()) {
                root.get("weaknesses").forEach(node -> weaknesses.add(node.asText()));
            }

            List<String> suggestions = new ArrayList<>();
            if (root.has("suggestions") && root.get("suggestions").isArray()) {
                root.get("suggestions").forEach(node -> suggestions.add(node.asText()));
            }

            String summary = root.has("summary") ? root.get("summary").asText() : "Không có tóm tắt";

            return CVAnalysisResponseDto.builder()
                    .matchScore(matchScore)
                    .strengths(strengths)
                    .weaknesses(weaknesses)
                    .suggestions(suggestions)
                    .summary(summary)
                    .build();

        } catch (Exception e) {
            log.error("Error parsing AI response: {}", response, e);
            // Return default response on parse error
            return CVAnalysisResponseDto.builder()
                    .matchScore(50)
                    .strengths(List.of("Không thể phân tích chi tiết"))
                    .weaknesses(List.of("Vui lòng thử lại sau"))
                    .suggestions(List.of("Đảm bảo CV ở định dạng rõ ràng"))
                    .summary("Có lỗi xảy ra khi phân tích CV. Vui lòng thử lại.")
                    .build();
        }
    }

    private String extractJson(String response) {
        // Remove markdown code blocks if present
        String cleaned = response;

        // Handle ```json ... ``` format
        if (cleaned.contains("```json")) {
            int start = cleaned.indexOf("```json") + 7;
            int end = cleaned.indexOf("```", start);
            if (end > start) {
                cleaned = cleaned.substring(start, end);
            }
        } else if (cleaned.contains("```")) {
            int start = cleaned.indexOf("```") + 3;
            int end = cleaned.indexOf("```", start);
            if (end > start) {
                cleaned = cleaned.substring(start, end);
            }
        }

        // Find JSON object boundaries
        int jsonStart = cleaned.indexOf("{");
        int jsonEnd = cleaned.lastIndexOf("}");

        if (jsonStart >= 0 && jsonEnd > jsonStart) {
            cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
        }

        return cleaned.trim();
    }
}
