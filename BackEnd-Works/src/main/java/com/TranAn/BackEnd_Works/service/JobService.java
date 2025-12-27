package com.TranAn.BackEnd_Works.service;

import com.TranAn.BackEnd_Works.dto.request.job.JobRequestDto;
import com.TranAn.BackEnd_Works.dto.response.job.JobResponseDto;
import com.TranAn.BackEnd_Works.model.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Map;

public interface JobService {
    Page<JobResponseDto> findAllJobs(Specification<Job> spec, Pageable pageable);

    Page<JobResponseDto> findAllJobsForRecruiterCompany(Specification<Job> spec, Pageable pageable);

    JobResponseDto findJobById(Long id);

    JobResponseDto saveJob(JobRequestDto jobRequestDto, boolean isRecruiter);

    JobResponseDto updateJobById(Long id, JobRequestDto jobRequestDto, boolean isRecruiter);

    JobResponseDto deleteJobById(Long id);

    JobResponseDto deleteJobByIdForRecruiterCompany(Long id);

    List<JobResponseDto> findJobByCompanyId(Long id);

    // Thống kê công việc theo trình độ
    Map<String, Long> getJobStatsByLevel();

    // Thống kê công việc theo trình độ cho công ty của Recruiter
    Map<String, Long> getJobStatsByLevelForRecruiterCompany();
}
