package com.TranAn.BackEnd_Works.service.impl;

import com.TranAn.BackEnd_Works.dto.request.job.JobRequestDto;
import com.TranAn.BackEnd_Works.dto.response.job.JobResponseDto;
import com.TranAn.BackEnd_Works.model.*;
import com.TranAn.BackEnd_Works.repository.*;
import com.TranAn.BackEnd_Works.service.JobService;
import com.TranAn.BackEnd_Works.service.S3Service;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {
        private final JobRepository jobRepository;
        private final SkillRepository skillRepository;
        private final CompanyRepository companyRepository;
        private final UserRepository userRepository;
        private final ResumeRepository resumeRepository;
        private final S3Service s3Service;

        @Override
        public Page<JobResponseDto> findAllJobs(Specification<Job> spec, Pageable pageable) {
                return jobRepository.findAll(spec, pageable)
                                .map(this::mapToResponseDto);
        }

        @Override
        public Page<JobResponseDto> findAllJobsForRecruiterCompany(
                        Specification<Job> spec, Pageable pageable) {
                String email = SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                                .getName();

                User user = userRepository
                                .findByEmail(email)
                                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));

                if (user.getCompany() == null)
                        throw new EntityNotFoundException("Không tìm thấy công ty người dùng");

                return jobRepository
                                .findByCompanyId(user.getCompany().getId(), spec, pageable)
                                .map(this::mapToResponseDto);
        }

        @Override
        public JobResponseDto findJobById(Long id) {
                return jobRepository
                                .findById(id)
                                .map(this::mapToResponseDto)
                                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy công việc"));
        }

        @Override
        public JobResponseDto saveJob(JobRequestDto jobRequestDto, boolean isRecruiter) {

                Job job = new Job(
                                jobRequestDto.getName(),
                                jobRequestDto.getLocation(),
                                jobRequestDto.getSalary(),
                                jobRequestDto.getQuantity(),
                                jobRequestDto.getLevel(),
                                jobRequestDto.getDescription(),
                                jobRequestDto.getStartDate(),
                                jobRequestDto.getEndDate(),
                                jobRequestDto.getStatus());

                if (isRecruiter) {
                        String email = SecurityContextHolder
                                        .getContext()
                                        .getAuthentication()
                                        .getName();

                        User user = userRepository
                                        .findByEmail(email)
                                        .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));

                        if (user.getCompany() == null)
                                throw new EntityNotFoundException("Không tìm thấy công ty người dùng");

                        job.setCompany(user.getCompany());
                } else {
                        Company company = null;
                        if (jobRequestDto.getCompany() != null)
                                company = companyRepository
                                                .findById(jobRequestDto.getCompany().getId())
                                                .orElseThrow(() -> new EntityNotFoundException(
                                                                "Công ty không tồn tại"));

                        job.setCompany(company);
                }

                List<Skill> skills;
                if (jobRequestDto.getSkills() != null) {
                        List<Long> skillIds = jobRequestDto
                                        .getSkills()
                                        .stream()
                                        .map(JobRequestDto.SkillId::getId)
                                        .toList();

                        skills = skillRepository.findAllById(skillIds);

                        if (skills.size() != skillIds.size()) {
                                throw new EntityNotFoundException("Kỹ năng không tồn tại");
                        }

                        job.setSkills(skills);
                }

                Job savedJob = jobRepository.saveAndFlush(job);

                return mapToResponseDto(savedJob);
        }

        @Override
        public JobResponseDto updateJobById(Long id, JobRequestDto jobRequestDto, boolean isRecruiter) {

                Job job = jobRepository
                                .findById(id)
                                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy công việc"));

                job.setName(jobRequestDto.getName());
                job.setLocation(jobRequestDto.getLocation());
                job.setSalary(jobRequestDto.getSalary());
                job.setQuantity(jobRequestDto.getQuantity());
                job.setLevel(jobRequestDto.getLevel());
                job.setDescription(jobRequestDto.getDescription());
                job.setStartDate(jobRequestDto.getStartDate());
                job.setEndDate(jobRequestDto.getEndDate());
                job.setStatus(jobRequestDto.getStatus());

                if (isRecruiter) {
                        String email = SecurityContextHolder
                                        .getContext()
                                        .getAuthentication()
                                        .getName();

                        User user = userRepository
                                        .findByEmail(email)
                                        .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));

                        if (user.getCompany() == null || job.getCompany() == null ||
                                        !user.getCompany().getId().equals(job.getCompany().getId()))
                                throw new AccessDeniedException("Không có quyền truy cập");
                } else if (jobRequestDto.getCompany() != null
                                && !Objects.equals(jobRequestDto.getCompany().getId(), job.getCompany().getId())) {
                        Company company = companyRepository
                                        .findById(jobRequestDto.getCompany().getId())
                                        .orElseThrow(() -> new EntityNotFoundException("Công ty không tồn tại"));

                        job.setCompany(company);
                }

                if (jobRequestDto.getSkills() != null) {
                        Set<Long> requestedSkillIds = jobRequestDto.getSkills().stream()
                                        .map(JobRequestDto.SkillId::getId)
                                        .collect(Collectors.toSet());

                        Set<Skill> currentSkills = new HashSet<>(job.getSkills());

                        currentSkills.removeIf(skill -> !requestedSkillIds.contains(skill.getId()));

                        Set<Long> currentSkillIds = currentSkills.stream()
                                        .map(Skill::getId)
                                        .collect(Collectors.toSet());

                        Set<Long> newSkillIdsToAdd = new HashSet<>(requestedSkillIds);
                        newSkillIdsToAdd.removeAll(currentSkillIds);

                        if (!newSkillIdsToAdd.isEmpty()) {
                                List<Skill> skillsToAdd = skillRepository.findAllById(newSkillIdsToAdd);
                                currentSkills.addAll(skillsToAdd);
                        }

                        job.setSkills(new ArrayList<>(currentSkills));
                }

                Job updatedJob = jobRepository.saveAndFlush(job);

                return mapToResponseDto(updatedJob);
        }

        @Override
        public JobResponseDto deleteJobById(Long id) {
                Job job = jobRepository
                                .findById(id)
                                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy công việc"));

                cleanupJobResumesAndSkills(job);

                Job updatedJob = jobRepository.saveAndFlush(job);
                jobRepository.delete(updatedJob);

                return mapToResponseDto(job);
        }

        @Override
        public JobResponseDto deleteJobByIdForRecruiterCompany(Long id) {
                String email = SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                                .getName();

                User user = userRepository
                                .findByEmail(email)
                                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));

                if (user.getCompany() == null)
                        throw new EntityNotFoundException("Không tìm thấy công ty người dùng");

                Job job = jobRepository
                                .findById(id)
                                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy công việc"));

                if (!user.getCompany().getId().equals(job.getCompany().getId()))
                        throw new EntityNotFoundException("Không có quyền truy cập");

                cleanupJobResumesAndSkills(job);

                Job updatedJob = jobRepository.saveAndFlush(job);
                jobRepository.delete(updatedJob);

                return mapToResponseDto(job);
        }

        @Override
        public List<JobResponseDto> findJobByCompanyId(Long id) {
                return jobRepository
                                .findByCompanyId(id)
                                .stream()
                                .map(job -> {
                                        JobResponseDto dto = mapToResponseDto(job);
                                        dto.setDescription(null);
                                        dto.setCompany(null);
                                        return dto;
                                })
                                .collect(Collectors.toList());
        }

        private JobResponseDto mapToResponseDto(Job job) {
                Company company = job.getCompany();
                JobResponseDto.CompanyDto companyDto = null;

                if (company != null) {
                        CompanyLogo logo = company.getCompanyLogo();
                        String logoUrl = (logo != null) ? logo.getLogoUrl() : null;

                        companyDto = new JobResponseDto.CompanyDto(
                                        company.getId(),
                                        company.getName(),
                                        logoUrl,
                                        company.getAddress());
                }

                List<JobResponseDto.SkillDto> skillDtos = job.getSkills() == null
                                ? List.of()
                                : job.getSkills().stream()
                                                .map(skill -> new JobResponseDto.SkillDto(skill.getId(),
                                                                skill.getName()))
                                                .toList();

                return new JobResponseDto(
                                job.getId(),
                                job.getName(),
                                job.getLocation(),
                                job.getSalary(),
                                job.getQuantity(),
                                job.getLevel().toString(),
                                job.getDescription(),
                                job.getStartDate(),
                                job.getEndDate(),
                                calculateStatus(job),
                                companyDto,
                                skillDtos);
        }

        /**
         * Tính toán trạng thái công việc realtime dựa trên endDate
         */
        private String calculateStatus(Job job) {
                // Nếu trạng thái là PAUSED hoặc DRAFT, giữ nguyên
                if (job.getStatus() == com.TranAn.BackEnd_Works.model.constant.JobStatus.PAUSED ||
                                job.getStatus() == com.TranAn.BackEnd_Works.model.constant.JobStatus.DRAFT) {
                        return job.getStatus().name();
                }
                // Tự động tính EXPIRED nếu endDate đã qua
                if (job.getEndDate() != null && job.getEndDate().isBefore(Instant.now())) {
                        return com.TranAn.BackEnd_Works.model.constant.JobStatus.EXPIRED.name();
                }
                return com.TranAn.BackEnd_Works.model.constant.JobStatus.ACTIVE.name();
        }

        private void cleanupJobResumesAndSkills(Job job) {
                if (job.getSkills() != null)
                        job.getSkills().clear();
                if (job.getResumes() != null) {
                        List<Resume> resumes = job.getResumes();
                        resumes.forEach(resume -> {
                                if (resume.getFileKey() != null)
                                        s3Service.deleteFileByKey(resume.getFileKey());
                        });
                        resumeRepository.deleteAll(resumes);
                }
        }

        @Override
        public Map<String, Long> getJobStatsByLevel() {
                Map<String, Long> stats = new LinkedHashMap<>();
                stats.put("INTERN", jobRepository.countByLevel(com.TranAn.BackEnd_Works.model.constant.Level.INTERN));
                stats.put("FRESHER", jobRepository.countByLevel(com.TranAn.BackEnd_Works.model.constant.Level.FRESHER));
                stats.put("MIDDLE", jobRepository.countByLevel(com.TranAn.BackEnd_Works.model.constant.Level.MIDDLE));
                stats.put("SENIOR", jobRepository.countByLevel(com.TranAn.BackEnd_Works.model.constant.Level.SENIOR));
                stats.put("LEADER", jobRepository.countByLevel(com.TranAn.BackEnd_Works.model.constant.Level.LEADER));
                return stats;
        }

        @Override
        public Map<String, Long> getJobStatsByLevelForRecruiterCompany() {
                String email = SecurityContextHolder.getContext().getAuthentication().getName();
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));

                if (user.getCompany() == null) {
                        throw new EntityNotFoundException("Không tìm thấy công ty của người dùng");
                }

                Long companyId = user.getCompany().getId();
                Map<String, Long> stats = new LinkedHashMap<>();
                stats.put("INTERN",
                                jobRepository.countByLevelAndCompanyId(
                                                com.TranAn.BackEnd_Works.model.constant.Level.INTERN,
                                                companyId));
                stats.put("FRESHER", jobRepository
                                .countByLevelAndCompanyId(com.TranAn.BackEnd_Works.model.constant.Level.FRESHER,
                                                companyId));
                stats.put("MIDDLE",
                                jobRepository.countByLevelAndCompanyId(
                                                com.TranAn.BackEnd_Works.model.constant.Level.MIDDLE,
                                                companyId));
                stats.put("SENIOR",
                                jobRepository.countByLevelAndCompanyId(
                                                com.TranAn.BackEnd_Works.model.constant.Level.SENIOR,
                                                companyId));
                stats.put("LEADER",
                                jobRepository.countByLevelAndCompanyId(
                                                com.TranAn.BackEnd_Works.model.constant.Level.LEADER,
                                                companyId));
                return stats;
        }
}
