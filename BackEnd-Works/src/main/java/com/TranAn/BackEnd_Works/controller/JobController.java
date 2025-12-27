package com.TranAn.BackEnd_Works.controller;

import com.TranAn.BackEnd_Works.annotation.ApiMessage;
import com.TranAn.BackEnd_Works.dto.request.job.JobRequestDto;
import com.TranAn.BackEnd_Works.dto.response.PageResponseDto;
import com.TranAn.BackEnd_Works.dto.response.job.JobResponseDto;
import com.TranAn.BackEnd_Works.model.Job;
import com.TranAn.BackEnd_Works.service.JobService;
import com.turkraft.springfilter.boot.Filter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Job")
@RestController
@RequestMapping("/jobs")
@RequiredArgsConstructor
public class JobController {

        private final JobService jobService;

        @PostMapping
        @ApiMessage(value = "Tạo Job")
        @PreAuthorize("hasAuthority('POST /jobs')")
        @Operation(summary = "Tạo Job", description = "Yêu cầu quyền: <b>POST /jobs</b>")
        public ResponseEntity<?> saveJob(@Valid @RequestBody JobRequestDto jobRequestDto) {
                return ResponseEntity.ok(jobService.saveJob(jobRequestDto, false));
        }

        @PostMapping("/company")
        @ApiMessage(value = "Tạo Job thuộc company của người dùng hiện tại")
        @PreAuthorize("hasAuthority('POST /jobs/company')")
        @Operation(summary = "Tạo Job thuộc company của người dùng hiện tại", description = "Yêu cầu quyền: <b>POST /jobs/company</b>")
        public ResponseEntity<?> saveJobForRecruiterPage(@Valid @RequestBody JobRequestDto jobRequestDto) {
                return ResponseEntity.ok(jobService.saveJob(jobRequestDto, true));
        }

        @GetMapping
        @ApiMessage(value = "Lấy danh sách Job")
        @PreAuthorize("hasAuthority('GET /jobs') OR isAnonymous()")
        @Operation(summary = "Lấy danh sách Job", description = "Yêu cầu quyền: <b>GET /jobs</b>")
        @SecurityRequirements()
        public ResponseEntity<?> findAllJobs(
                        @Filter Specification<Job> spec,
                        @PageableDefault(size = 5) Pageable pageable) {
                Page<JobResponseDto> page = jobService.findAllJobs(spec, pageable);

                PageResponseDto<JobResponseDto> res = new PageResponseDto<>(
                                page.getContent(),
                                pageable.getPageNumber() + 1,
                                pageable.getPageSize(),
                                page.getTotalElements(),
                                page.getTotalPages());

                return ResponseEntity.ok(res);
        }

        @GetMapping("/{id}")
        @ApiMessage(value = "Lấy Job theo id")
        @PreAuthorize("hasAuthority('GET /jobs/{id}') OR isAnonymous()")
        @Operation(summary = "Lấy Job theo id", description = "Yêu cầu quyền: <b>GET /jobs/{id}</b>")
        @SecurityRequirements()
        public ResponseEntity<?> findJobById(@PathVariable Long id) {
                return ResponseEntity.ok(jobService.findJobById(id));
        }

        @GetMapping("/companies/{id}")
        @ApiMessage(value = "Lấy Job theo Company")
        @PreAuthorize("hasAuthority('GET /jobs/companies/{id}') OR isAnonymous()")
        @Operation(summary = "Lấy Job theo Company", description = "Yêu cầu quyền: <b>GET /jobs/companies/{id}</b>")
        @SecurityRequirements()
        public ResponseEntity<?> findJobByCompanyId(@PathVariable Long id) {
                return ResponseEntity.ok(jobService.findJobByCompanyId(id));
        }

        @GetMapping("/company")
        @ApiMessage(value = "Lấy danh sách Job thuộc company của người dùng hiện tại")
        @PreAuthorize("hasAuthority('GET /jobs/company')")
        @Operation(summary = "Lấy danh sách Job theo company của người dùng hiện tại", description = "Yêu cầu quyền: <b>GET /jobs/company</b>")
        public ResponseEntity<?> findAllJobsForRecruiterCompany(
                        @Filter Specification<Job> spec,
                        @PageableDefault(size = 5) Pageable pageable) {
                Page<JobResponseDto> page = jobService.findAllJobsForRecruiterCompany(spec, pageable);

                PageResponseDto<JobResponseDto> res = new PageResponseDto<>(
                                page.getContent(),
                                pageable.getPageNumber() + 1,
                                pageable.getPageSize(),
                                page.getTotalElements(),
                                page.getTotalPages());

                return ResponseEntity.ok(res);
        }

        @PutMapping("/{id}")
        @ApiMessage(value = "Cập nhật Job theo id")
        @PreAuthorize("hasAuthority('PUT /jobs/{id}')")
        @Operation(summary = "Cập nhật Job theo id", description = "Yêu cầu quyền: <b>PUT /jobs/{id}</b>")
        public ResponseEntity<?> updateJobById(
                        @PathVariable Long id,
                        @Valid @RequestBody JobRequestDto jobRequestDto) {
                return ResponseEntity.ok(jobService.updateJobById(id, jobRequestDto, false));
        }

        @PutMapping("/company/{id}")
        @ApiMessage(value = "Cập nhật Job theo id thuộc company của người dùng hiện tại")
        @PreAuthorize("hasAuthority('PUT /jobs/company/{id}')")
        @Operation(summary = "Cập nhật Job theo id thuộc company của người dùng hiện tại", description = "Yêu cầu quyền: <b>PUT /jobs/company/{id}</b>")
        public ResponseEntity<?> updateJobByIdForRecruiterCompany(
                        @PathVariable Long id,
                        @Valid @RequestBody JobRequestDto jobRequestDto) {
                return ResponseEntity.ok(jobService.updateJobById(id, jobRequestDto, true));
        }

        @DeleteMapping("/{id}")
        @ApiMessage(value = "Xóa Job theo id")
        @PreAuthorize("hasAuthority('DELETE /jobs/{id}')")
        @Operation(summary = "Xóa Job theo id", description = "Yêu cầu quyền: <b>DELETE /jobs/{id}</b>")
        public ResponseEntity<?> deleteJobById(@PathVariable Long id) {
                return ResponseEntity.ok(jobService.deleteJobById(id));
        }

        @DeleteMapping("/company/{id}")
        @ApiMessage(value = "Xóa Job theo id thuộc company của người dùng hiện tại")
        @PreAuthorize("hasAuthority('DELETE /jobs/company/{id}')")
        @Operation(summary = "Xóa Job theo id thuộc company của người dùng hiện tại", description = "Yêu cầu quyền: <b>DELETE /jobs/company/{id}</b>")
        public ResponseEntity<?> deleteJobByIdForRecruiterCompany(@PathVariable Long id) {
                return ResponseEntity.ok(jobService.deleteJobByIdForRecruiterCompany(id));
        }

        @GetMapping("/stats/level")
        @ApiMessage(value = "Thống kê công việc theo trình độ")
        @PreAuthorize("hasAuthority('GET /jobs/stats/level')")
        @Operation(summary = "Thống kê số lượng công việc theo trình độ", description = "Trả về số lượng công việc cho mỗi trình độ (INTERN, FRESHER, MIDDLE, SENIOR, LEADER)")
        @SecurityRequirements()
        public ResponseEntity<?> getJobStatsByLevel() {
                return ResponseEntity.ok(jobService.getJobStatsByLevel());
        }

        @GetMapping("/company/stats/level")
        @ApiMessage(value = "Thống kê công việc theo trình độ của công ty")
        @PreAuthorize("hasAuthority('GET /jobs/company')")
        @Operation(summary = "Thống kê số lượng công việc theo trình độ cho công ty của Recruiter", description = "Trả về số lượng công việc cho mỗi trình độ (INTERN, FRESHER, MIDDLE, SENIOR, LEADER) thuộc công ty của người dùng hiện tại")
        public ResponseEntity<?> getJobStatsByLevelForRecruiterCompany() {
                return ResponseEntity.ok(jobService.getJobStatsByLevelForRecruiterCompany());
        }

}
