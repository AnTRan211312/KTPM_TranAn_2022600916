package com.TranAn.BackEnd_Works.service;

import com.TranAn.BackEnd_Works.dto.request.resume.ResumeRequestDto;
import com.TranAn.BackEnd_Works.dto.request.resume.UpdateResumeStatusRequestDto;
import com.TranAn.BackEnd_Works.dto.response.resume.CreateResumeResponseDto;
import com.TranAn.BackEnd_Works.dto.response.resume.DefaultResumeResponseDto;
import com.TranAn.BackEnd_Works.dto.response.resume.GetResumeFileResponseDto;
import com.TranAn.BackEnd_Works.dto.response.resume.ResumeForDisplayResponseDto;
import com.TranAn.BackEnd_Works.model.Resume;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

public interface ResumeService {

        CreateResumeResponseDto saveResume(
                        ResumeRequestDto resumeRequestDto,
                        MultipartFile pdfFile);

        Page<ResumeForDisplayResponseDto> findAllResumesForRecruiterCompany(
                        Specification<Resume> spec,
                        Pageable pageable);

        Page<ResumeForDisplayResponseDto> findSelfResumes(
                        Specification<Resume> spec,
                        Pageable pageable);

        DefaultResumeResponseDto removeSelfResumeByJobId(Long jobId);

        DefaultResumeResponseDto updateSelfResumeFile(Long id, MultipartFile pdfFile);

        GetResumeFileResponseDto getResumeFileUrl(Long id);

        Page<ResumeForDisplayResponseDto> findAllResumes(
                        Specification<Resume> spec,
                        Pageable pageable);

        DefaultResumeResponseDto updateResumeStatus(UpdateResumeStatusRequestDto updateResumeStatusRequestDto);

        DefaultResumeResponseDto updateResumeStatusForRecruiterCompany(
                        UpdateResumeStatusRequestDto updateResumeStatusRequestDto);

        // Thống kê hồ sơ theo trạng thái
        Map<String, Long> getResumeStatsByStatus();

        // Thống kê hồ sơ theo trạng thái cho công ty của Recruiter
        Map<String, Long> getResumeStatsByStatusForRecruiterCompany();

        // Kiểm tra user đã nộp CV cho job này chưa
        boolean hasApplied(Long jobId);
}
