package com.TranAn.BackEnd_Works.controller;

import com.TranAn.BackEnd_Works.annotation.ApiMessage;
import com.TranAn.BackEnd_Works.dto.request.resume.ResumeRequestDto;
import com.TranAn.BackEnd_Works.dto.request.resume.UpdateResumeStatusRequestDto;
import com.TranAn.BackEnd_Works.dto.response.PageResponseDto;
import com.TranAn.BackEnd_Works.dto.response.resume.CVAnalysisResponseDto;
import com.TranAn.BackEnd_Works.dto.response.resume.ResumeForDisplayResponseDto;
import com.TranAn.BackEnd_Works.model.Resume;
import com.TranAn.BackEnd_Works.service.CVAnalysisService;
import com.TranAn.BackEnd_Works.service.ResumeService;
import com.turkraft.springfilter.boot.Filter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Resume")
@RestController
@RequestMapping("/resumes")
@RequiredArgsConstructor
public class ResumeController {

        private final ResumeService resumeService;
        private final CVAnalysisService cvAnalysisService;

        @PostMapping
        @ApiMessage(value = "Tạo Resume")
        @PreAuthorize("hasAuthority('POST /resumes')")
        @Operation(summary = "Tạo Resume", description = "Yêu cầu quyền: <b>POST /resumes</b>")
        public ResponseEntity<?> saveResume(
                        @Valid @RequestPart("resume") ResumeRequestDto resumeRequestDto,
                        @RequestPart(value = "pdfFile") MultipartFile pdfFile) {
                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(resumeService.saveResume(resumeRequestDto, pdfFile));
        }

        @GetMapping("/check-applied/{jobId}")
        @ApiMessage(value = "Kiểm tra đã nộp CV cho công việc này chưa")
        @PreAuthorize("hasAuthority('POST /resumes')")
        @Operation(summary = "Kiểm tra user hiện tại đã nộp CV cho job này chưa", description = "Trả về true/false")
        public ResponseEntity<?> checkApplied(@PathVariable Long jobId) {
                return ResponseEntity.ok(resumeService.hasApplied(jobId));
        }

        @GetMapping
        @ApiMessage(value = "Lấy danh sách resume")
        @PreAuthorize("hasAuthority('GET /resumes')")
        @Operation(summary = "Lấy danh sách resume", description = "Yêu cầu quyền: <b>GET /resumes</b>")
        public ResponseEntity<?> findAllResumes(
                        @Filter Specification<Resume> spec,
                        @PageableDefault(size = 5) Pageable pageable) {
                Page<ResumeForDisplayResponseDto> page = resumeService.findAllResumes(spec, pageable);

                PageResponseDto<ResumeForDisplayResponseDto> res = new PageResponseDto<>(
                                page.getContent(),
                                pageable.getPageNumber() + 1,
                                pageable.getPageSize(),
                                page.getTotalElements(),
                                page.getTotalPages());

                return ResponseEntity.ok(res);
        }

        @GetMapping("/company")
        @ApiMessage(value = "Lấy danh sách resume thuộc company của người dùng hiện tại")
        @PreAuthorize("hasAuthority('GET /resumes/company')")
        @Operation(summary = "Lấy danh sách resume theo company của người dùng hiện tại", description = "Yêu cầu quyền: <b>GET /resumes/company</b>")
        public ResponseEntity<?> findAllResumesForRecruiterCompany(
                        @Filter Specification<Resume> spec,
                        @PageableDefault(size = 5) Pageable pageable) {
                Page<ResumeForDisplayResponseDto> page = resumeService.findAllResumesForRecruiterCompany(spec,
                                pageable);

                PageResponseDto<ResumeForDisplayResponseDto> res = new PageResponseDto<>(
                                page.getContent(),
                                pageable.getPageNumber() + 1,
                                pageable.getPageSize(),
                                page.getTotalElements(),
                                page.getTotalPages());

                return ResponseEntity.ok(res);
        }

        @GetMapping("/me")
        @ApiMessage(value = "Lấy resume theo người dùng")
        @PreAuthorize("hasAuthority('GET /resumes/me')")
        @Operation(summary = "Lấy resume của người dùng hiện tại", description = "Yêu cầu quyền: <b>GET /resumes/me</b>")
        public ResponseEntity<?> findSelfResumes(
                        @Filter Specification<Resume> spec,
                        @PageableDefault(size = 5) Pageable pageable) {
                Page<ResumeForDisplayResponseDto> page = resumeService.findSelfResumes(spec, pageable);

                PageResponseDto<ResumeForDisplayResponseDto> res = new PageResponseDto<>(
                                page.getContent(),
                                pageable.getPageNumber() + 1,
                                pageable.getPageSize(),
                                page.getTotalElements(),
                                page.getTotalPages());

                return ResponseEntity.ok(res);
        }

        @DeleteMapping("/me/jobs/{jobId}")
        @ApiMessage(value = "Xóa resume theo job id của người dùng hiện tại")
        @PreAuthorize("hasAuthority('DELETE /resumes/me/jobs/{jobId}')")
        @Operation(summary = "Xóa resume theo job id của người dùng hiện tại", description = "Yêu cầu quyền: <b>DELETE /resumes/me/jobs/{jobId}</b>")
        public ResponseEntity<?> removeSelfResumeByJobId(
                        @PathVariable Long jobId) {
                return ResponseEntity.ok(resumeService.removeSelfResumeByJobId(jobId));
        }

        @PutMapping("/me/file/{id}")
        @ApiMessage(value = "Cập nhật file resume")
        @PreAuthorize("hasAuthority('PUT /resumes/me/file/{id}')")
        @Operation(summary = "Cập nhật file resume", description = "Yêu cầu quyền: <b>PUT /resumes/me/file/{id}</b>")
        public ResponseEntity<?> updateSelfResumeFile(
                        @PathVariable Long id,
                        @RequestPart("pdfFile") MultipartFile pdfFile) {
                return ResponseEntity.ok(resumeService.updateSelfResumeFile(id, pdfFile));
        }

        @GetMapping("/file/{id}")
        @ApiMessage(value = "Lấy file resume")
        @PreAuthorize("hasAuthority('GET /resumes/file/{id}')")
        @Operation(summary = "Lấy file resume", description = "Yêu cầu quyền: <b>GET /resumes/file/{id}</b>")
        public ResponseEntity<?> getResumeFileUrl(@PathVariable Long id) {
                return ResponseEntity.ok(resumeService.getResumeFileUrl(id));
        }

        @PutMapping("/status")
        @ApiMessage("Cập nhật trạng thái resume")
        @PreAuthorize("hasAuthority('PUT /resumes/status')")
        @Operation(summary = "Cập nhật trạng thái resume", description = "Yêu cầu quyền: <b>PUT /resumes/status</b>")
        public ResponseEntity<?> updateResumeStatus(
                        @RequestBody UpdateResumeStatusRequestDto updateResumeStatusRequestDto) {
                return ResponseEntity.ok(resumeService.updateResumeStatus(updateResumeStatusRequestDto));
        }

        @PutMapping("/company/status")
        @ApiMessage("Cập nhật trạng thái resume thuộc company của người dùng hiện tại")
        @PreAuthorize("hasAuthority('PUT /resumes/company/status')")
        @Operation(summary = "Cập nhật trạng thái resume theo company của người dùng hiện tại", description = "Yêu cầu quyền: <b>PUT /resumes/company/status</b>")
        public ResponseEntity<?> updateResumeStatusForRecruiterCompany(
                        @RequestBody UpdateResumeStatusRequestDto updateResumeStatusRequestDto) {
                return ResponseEntity
                                .ok(resumeService.updateResumeStatusForRecruiterCompany(updateResumeStatusRequestDto));
        }

        @GetMapping("/stats/status")
        @ApiMessage(value = "Thống kê hồ sơ theo trạng thái")
        @PreAuthorize("hasAuthority('GET /resumes')")
        @Operation(summary = "Thống kê số lượng hồ sơ theo trạng thái", description = "Trả về số lượng hồ sơ cho mỗi trạng thái (PENDING, REVIEWING, APPROVED, REJECTED)")
        public ResponseEntity<?> getResumeStatsByStatus() {
                return ResponseEntity.ok(resumeService.getResumeStatsByStatus());
        }

        @GetMapping("/company/stats/status")
        @ApiMessage(value = "Thống kê hồ sơ theo trạng thái của công ty")
        @PreAuthorize("hasAuthority('GET /resumes/company')")
        @Operation(summary = "Thống kê số lượng hồ sơ theo trạng thái cho công ty của Recruiter", description = "Trả về số lượng hồ sơ cho mỗi trạng thái (PENDING, REVIEWING, APPROVED, REJECTED) thuộc công ty của người dùng hiện tại")
        public ResponseEntity<?> getResumeStatsByStatusForRecruiterCompany() {
                return ResponseEntity.ok(resumeService.getResumeStatsByStatusForRecruiterCompany());
        }

        @PostMapping("/{id}/analyze")
        @ApiMessage(value = "Phân tích CV bằng AI")
        @PreAuthorize("hasAuthority('GET /resumes/company')")
        @Operation(summary = "Phân tích CV đã nộp bằng AI", description = "Sử dụng AI để phân tích độ phù hợp của CV với công việc. Yêu cầu quyền: <b>GET /resumes/company</b>")
        public ResponseEntity<?> analyzeResume(@PathVariable Long id) {
                return ResponseEntity.ok(cvAnalysisService.analyzeResume(id));
        }

        @PostMapping("/analyze-preview")
        @ApiMessage(value = "Phân tích CV preview bằng AI")
        @PreAuthorize("hasAuthority('POST /resumes')")
        @Operation(summary = "Phân tích CV trước khi nộp", description = "Cho phép người dùng phân tích độ phù hợp của CV với công việc trước khi nộp đơn. Yêu cầu quyền: <b>POST /resumes</b>")
        public ResponseEntity<?> analyzeResumePreview(
                        @RequestPart("pdfFile") MultipartFile pdfFile,
                        @RequestParam Long jobId) {
                return ResponseEntity.ok(cvAnalysisService.analyzeResumePreview(pdfFile, jobId));
        }

}
