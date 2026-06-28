package com.TranAn.BackEnd_Works.service;

import com.TranAn.BackEnd_Works.dto.response.job.JobSearchResult;
import com.TranAn.BackEnd_Works.model.Job;
import com.TranAn.BackEnd_Works.model.Skill;
import com.TranAn.BackEnd_Works.model.constant.JobStatus;
import com.TranAn.BackEnd_Works.repository.JobRepository;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * AI-callable job search service.
 *
 * Each @Tool method is automatically exposed to the LLM via Spring AI's tool discovery.
 * The LLM reads the tool descriptions and decides when/how to invoke them
 * based on the user's natural language query — zero hardcoded intent detection.
 *
 * Design decisions:
 *  - Salary is stored and queried as plain Double (treated as million VND).
 *  - All queries filter for ACTIVE + non-expired jobs only.
 *  - Result count is capped at MAX_TOOL_RESULTS to stay within LLM context limits.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class JobSearchToolService {

    private static final int MAX_TOOL_RESULTS = 20;
    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy").withZone(ZoneId.of("Asia/Ho_Chi_Minh"));

    private final JobRepository jobRepository;

    // ========== @Tool Methods — exposed to AI model ==========

    @Tool(name = "searchJobsByMinSalary",
            description = "Tìm kiếm công việc có mức lương từ một ngưỡng tối thiểu trở lên. "
                    + "Dùng khi người dùng hỏi 'lương từ X triệu', 'lương trên X triệu', 'mức lương ít nhất X'. "
                    + "Đơn vị lương là triệu VND (30 = 30 triệu VND).")
    public List<JobSearchResult> searchJobsByMinSalary(
            @ToolParam(description = "Mức lương tối thiểu tính bằng triệu VND, ví dụ: 30 = 30 triệu") double minSalaryMillionVnd,
            @ToolParam(description = "Số lượng kết quả tối đa, mặc định 10, không vượt quá 20") int limit
    ) {
        log.info("[AI Tool] searchJobsByMinSalary: minSalary={}M VND, limit={}", minSalaryMillionVnd, limit);
        return searchJobsAdvanced(null, minSalaryMillionVnd, null, null, null, limit);
    }

    @Tool(name = "searchJobsByKeyword",
            description = "Tìm kiếm công việc theo từ khóa trong tên công việc hoặc kỹ năng yêu cầu. "
                    + "Dùng khi người dùng tìm kiếm một công nghệ hoặc vị trí cụ thể như 'Java', 'React', "
                    + "'Backend Developer', 'Data Analyst', 'Kế toán', v.v.")
    public List<JobSearchResult> searchJobsByKeyword(
            @ToolParam(description = "Từ khóa tìm kiếm trong tên job hoặc danh sách kỹ năng") String keyword,
            @ToolParam(description = "Số lượng kết quả tối đa, mặc định 10") int limit
    ) {
        log.info("[AI Tool] searchJobsByKeyword: keyword='{}', limit={}", keyword, limit);
        return searchJobsAdvanced(keyword, null, null, null, null, limit);
    }

    @Tool(name = "searchJobsByLevel",
            description = "Tìm kiếm công việc theo cấp bậc kinh nghiệm. "
                    + "Dùng khi người dùng đề cập đến level như 'intern', 'fresher', 'junior', 'mid-level', 'senior', 'lead/manager'. "
                    + "Các giá trị hợp lệ: INTERN, FRESHER, MIDDLE, SENIOR, LEADER.")
    public List<JobSearchResult> searchJobsByLevel(
            @ToolParam(description = "Cấp bậc kinh nghiệm: INTERN, FRESHER, MIDDLE, SENIOR, hoặc LEADER") String level,
            @ToolParam(description = "Số lượng kết quả tối đa, mặc định 10") int limit
    ) {
        log.info("[AI Tool] searchJobsByLevel: level='{}', limit={}", level, limit);
        return searchJobsAdvanced(null, null, null, level, null, limit);
    }

    @Tool(name = "searchJobsByLocation",
            description = "Tìm kiếm công việc theo địa điểm làm việc. "
                    + "Dùng khi người dùng muốn tìm việc ở một thành phố hoặc khu vực cụ thể "
                    + "như 'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Remote', v.v.")
    public List<JobSearchResult> searchJobsByLocation(
            @ToolParam(description = "Tên thành phố hoặc địa điểm làm việc") String location,
            @ToolParam(description = "Số lượng kết quả tối đa, mặc định 10") int limit
    ) {
        log.info("[AI Tool] searchJobsByLocation: location='{}', limit={}", location, limit);
        return searchJobsAdvanced(null, null, null, null, location, limit);
    }

    @Tool(name = "searchJobsAdvanced",
            description = "Tìm kiếm công việc nâng cao kết hợp nhiều tiêu chí cùng lúc. "
                    + "Ưu tiên dùng tool này khi câu hỏi có từ 2 tiêu chí trở lên, "
                    + "ví dụ: 'Java senior lương 30 triệu ở Hà Nội'. "
                    + "Tất cả tham số đều tùy chọn, truyền null để bỏ qua điều kiện đó.")
    public List<JobSearchResult> searchJobsAdvanced(
            @ToolParam(description = "Từ khóa trong tên job hoặc kỹ năng (null = không lọc)") String keyword,
            @ToolParam(description = "Lương tối thiểu tính bằng triệu VND (null = không lọc)") Double minSalaryMillionVnd,
            @ToolParam(description = "Lương tối đa tính bằng triệu VND (null = không lọc)") Double maxSalaryMillionVnd,
            @ToolParam(description = "Cấp bậc: INTERN/FRESHER/MIDDLE/SENIOR/LEADER (null = không lọc)") String level,
            @ToolParam(description = "Địa điểm làm việc, tìm kiếm một phần (null = không lọc)") String location,
            @ToolParam(description = "Số lượng kết quả tối đa, mặc định 10, tối đa 20") int limit
    ) {
        log.info("[AI Tool] searchJobsAdvanced: keyword='{}', salary=[{}, {}]M, level='{}', location='{}', limit={}",
                keyword, minSalaryMillionVnd, maxSalaryMillionVnd, level, location, limit);

        int safeLimit = Math.min(Math.max(limit, 1), MAX_TOOL_RESULTS);

        Specification<Job> spec = buildJobSpec(keyword, minSalaryMillionVnd, maxSalaryMillionVnd, level, location);
        var pageable = PageRequest.of(0, safeLimit, Sort.by(Sort.Direction.DESC, "createdAt"));
        var page = jobRepository.findAll(spec, pageable);

        List<JobSearchResult> results = page.getContent()
                .stream()
                .map(this::toSearchResult)
                .collect(Collectors.toList());

        log.info("[AI Tool] searchJobsAdvanced returned {} results", results.size());
        return results;
    }

    // ========== Private Helpers ==========

    /**
     * Builds a dynamic JPA Specification. All filters are optional.
     * Always restricts to ACTIVE jobs whose endDate hasn't passed.
     */
    private Specification<Job> buildJobSpec(
            String keyword,
            Double minSalary,
            Double maxSalary,
            String levelStr,
            String location
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Base: ACTIVE and not expired
            predicates.add(cb.equal(root.get("status"), JobStatus.ACTIVE));
            predicates.add(cb.greaterThan(root.get("endDate"), Instant.now()));

            // Keyword: match in job name OR skills name
            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), pattern);

                var skillJoin = root.join("skills", JoinType.LEFT);
                Predicate skillMatch = cb.like(cb.lower(skillJoin.get("name")), pattern);

                predicates.add(cb.or(nameMatch, skillMatch));

                // Prevent duplicate rows from LEFT JOIN on skills
                if (query != null) {
                    query.distinct(true);
                }
            }

            // Salary range
            if (minSalary != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("salary"), minSalary));
            }
            if (maxSalary != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("salary"), maxSalary));
            }

            // Level (enum)
            if (levelStr != null && !levelStr.isBlank()) {
                try {
                    var levelEnum = com.TranAn.BackEnd_Works.model.constant.Level.valueOf(levelStr.toUpperCase());
                    predicates.add(cb.equal(root.get("level"), levelEnum));
                } catch (IllegalArgumentException ex) {
                    log.warn("[AI Tool] Unknown level '{}' — skipping level filter", levelStr);
                }
            }

            // Location: partial match
            if (location != null && !location.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%" + location.toLowerCase() + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    /** Maps a Job entity to the lightweight AI-facing projection. */
    private JobSearchResult toSearchResult(Job job) {
        List<String> skillNames = Optional.ofNullable(job.getSkills())
                .map(skills -> skills.stream().map(Skill::getName).collect(Collectors.toList()))
                .orElse(List.of());

        String companyName = Optional.ofNullable(job.getCompany())
                .map(com.TranAn.BackEnd_Works.model.Company::getName)
                .orElse("Đang cập nhật");

        String endDateStr = Optional.ofNullable(job.getEndDate())
                .map(DATE_FORMATTER::format)
                .orElse("Không xác định");

        return new JobSearchResult(
                job.getId(),
                job.getName(),
                companyName,
                job.getLocation(),
                job.getSalary() != null ? job.getSalary() : 0.0,
                job.getLevel() != null ? job.getLevel().name() : "MIDDLE",
                job.getStatus() != null ? job.getStatus().name() : "ACTIVE",
                skillNames,
                endDateStr
        );
    }
}
