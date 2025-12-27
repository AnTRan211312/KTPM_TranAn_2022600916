package com.TranAn.BackEnd_Works.service.impl;

import com.TranAn.BackEnd_Works.advice.exception.ResourceAlreadyExistsException;
import com.TranAn.BackEnd_Works.dto.request.resume.ResumeRequestDto;
import com.TranAn.BackEnd_Works.dto.request.resume.UpdateResumeStatusRequestDto;
import com.TranAn.BackEnd_Works.dto.response.resume.CreateResumeResponseDto;
import com.TranAn.BackEnd_Works.dto.response.resume.DefaultResumeResponseDto;
import com.TranAn.BackEnd_Works.dto.response.resume.GetResumeFileResponseDto;
import com.TranAn.BackEnd_Works.dto.response.resume.ResumeForDisplayResponseDto;
import com.TranAn.BackEnd_Works.model.*;
import com.TranAn.BackEnd_Works.repository.JobRepository;
import com.TranAn.BackEnd_Works.repository.ResumeRepository;
import com.TranAn.BackEnd_Works.repository.UserRepository;
import com.TranAn.BackEnd_Works.service.EmailService;
import com.TranAn.BackEnd_Works.service.ResumeService;
import com.TranAn.BackEnd_Works.service.NotificationService;

import com.TranAn.BackEnd_Works.service.S3Service;
import jakarta.mail.MessagingException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ResumeServiceImpl implements ResumeService {

        private final ResumeRepository resumeRepository;
        private final UserRepository userRepository;
        private final JobRepository jobRepository;
        private final EmailService emailService;
        private final S3Service s3Service;
        private final NotificationService notificationService;

        @Override
        public CreateResumeResponseDto saveResume(
                        ResumeRequestDto resumeRequestDto,
                        MultipartFile pdfFile) {
                Resume resume = new Resume(
                                resumeRequestDto.getEmail(),
                                resumeRequestDto.getStatus(),
                                1L);

                User user = userRepository
                                .findById(resumeRequestDto.getUser().getId())
                                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));

                if (!user.getEmail().equals(resume.getEmail()))
                        throw new EntityNotFoundException("Truy cập bị từ chối");

                Job job = jobRepository
                                .findById(resumeRequestDto.getJob().getId())
                                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy công việc"));

                // Kiểm tra hạn nộp CV
                if (job.getEndDate() != null && job.getEndDate().isBefore(Instant.now())) {
                        throw new IllegalStateException("Công việc này đã hết hạn nộp CV");
                }

                // Kiểm tra trạng thái active của job
                if (job.getStatus() == null
                                || job.getStatus() != com.TranAn.BackEnd_Works.model.constant.JobStatus.ACTIVE) {
                        throw new IllegalStateException("Công việc này không còn nhận CV");
                }

                if (resumeRepository.existsByUserIdAndJobId(user.getId(), job.getId()))
                        throw new ResourceAlreadyExistsException("Người dùng đã nộp resume cho công việc này");

                resume.setJob(job);
                resume.setUser(user);

                Resume savedResume = resumeRepository.saveAndFlush(resume);

                if (pdfFile != null && !pdfFile.isEmpty()) {
                        String safeEmail = savedResume.getEmail().replaceAll("[^a-zA-Z0-9]", "_");
                        String folderName = "resume/" + safeEmail;
                        String generatedFileName = "resume-" + savedResume.getId() + "-" + resume.getVersion() + ".pdf";

                        String key = s3Service.uploadFile(pdfFile, folderName, generatedFileName, false);

                        savedResume.setFileKey(key);
                } else
                        throw new EntityNotFoundException("Không tìm thấy tệp pdf");

                // Gửi thông báo in-app cho các recruiter của công ty
                try {
                        notificationService.notifyNewResume(
                                        savedResume.getId(),
                                        job.getId(),
                                        job.getCompany().getId(),
                                        user.getId(),
                                        user.getName(),
                                        job.getName());
                } catch (Exception e) {
                        // Log lỗi nhưng vẫn trả về kết quả thành công
                        System.err.println("Không thể gửi thông báo: " + e.getMessage());
                }

                return new CreateResumeResponseDto(
                                savedResume.getId(),
                                savedResume.getCreatedAt(),
                                savedResume.getCreatedBy());
        }

        @Override
        public Page<ResumeForDisplayResponseDto> findAllResumes(
                        Specification<Resume> spec,
                        Pageable pageable) {
                return resumeRepository
                                .findAll(spec, pageable)
                                .map(this::mapToResumeForDisplayResponseDto);
        }

        @Override
        public Page<ResumeForDisplayResponseDto> findAllResumesForRecruiterCompany(
                        Specification<Resume> spec,
                        Pageable pageable) {
                String email = SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                                .getName();

                User user = userRepository
                                .findByEmail(email)
                                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));

                if (user.getCompany() == null)
                        throw new EntityNotFoundException("Không tìm thấy công ty người dùng");

                Page<ResumeForDisplayResponseDto> data = resumeRepository
                                .findByUserCompanyId(user.getCompany().getId(), spec, pageable)
                                .map(this::mapToResumeForDisplayResponseDto);

                List<ResumeForDisplayResponseDto> filteredList = data.getContent().stream()
                                .filter(x -> x.getCompany().getId().equals(user.getCompany().getId()))
                                .toList();

                return new PageImpl<>(
                                filteredList,
                                data.getPageable(),
                                filteredList.size());
        }

        @Override
        public Page<ResumeForDisplayResponseDto> findSelfResumes(
                        Specification<Resume> spec,
                        Pageable pageable) {
                String email = SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                                .getName();

                return resumeRepository
                                .findByUserEmail(email, spec, pageable)
                                .map(this::mapToResumeForDisplayResponseDto);
        }

        // @Override
        // public ResumeForDisplayResponseDto findResumeById(Long id) {
        // Resume resume = resumeRepository
        // .findById(id)
        // .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy resume"));
        // return mapToResumeForDisplayResponseDto(resume);
        // }

        @Override
        public DefaultResumeResponseDto removeSelfResumeByJobId(Long jobId) {
                String email = SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                                .getName();

                Resume resume = resumeRepository
                                .findByUserEmailAndJobId(email, jobId)
                                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy resume"));

                DefaultResumeResponseDto res = mapToResponseDto(resume);

                resume.setUser(null);
                resume.setJob(null);

                s3Service.deleteFileByKey(resume.getFileKey());

                Resume savedResume = resumeRepository.saveAndFlush(resume);
                resumeRepository.delete(savedResume);

                return res;
        }

        @Override
        public DefaultResumeResponseDto updateSelfResumeFile(Long id, MultipartFile pdfFile) {
                String email = SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                                .getName();

                Resume resume = resumeRepository
                                .findByUserEmailAndId(email, id)
                                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy resume"));

                if (pdfFile != null && !pdfFile.isEmpty()) {
                        resume.setVersion(resume.getVersion() + 1);
                        String newKey = generateKey(resume.getEmail(), resume.getId(), resume.getVersion());

                        s3Service.deleteFileByKey(resume.getFileKey());
                        String uploadedKey = s3Service.uploadFile(pdfFile, newKey, false);
                        resume.setFileKey(uploadedKey);
                } else
                        throw new EntityNotFoundException("Không tìm thấy tệp pdf");

                resumeRepository.save(resume);

                return mapToResponseDto(resume);
        }

        @Override
        public GetResumeFileResponseDto getResumeFileUrl(Long id) {
                Resume resume = resumeRepository
                                .findById(id)
                                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy resume"));

                return new GetResumeFileResponseDto(
                                s3Service.generatePresignedUrl(resume.getFileKey(), Duration.ofMinutes(15)));
        }

        @Override
        public DefaultResumeResponseDto updateResumeStatus(
                        UpdateResumeStatusRequestDto updateResumeStatusRequestDto) {
                Resume resume = resumeRepository
                                .findById(updateResumeStatusRequestDto.getId())
                                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy resume"));

                resume.setStatus(updateResumeStatusRequestDto.getStatus());
                resumeRepository.save(resume);
                try {
                        String recipientEmail = resume.getUser().getEmail();
                        String jobName = resume.getJob().getName();
                        String companyName = resume.getJob().getCompany().getName();

                        // Fetch actor
                        String actorEmail = SecurityContextHolder.getContext().getAuthentication().getName();
                        User actor = userRepository.findByEmail(actorEmail).orElse(null);
                        Long actorId = actor != null ? actor.getId() : null;

                        notificationService.notifyResumeStatusUpdated(
                                        resume.getId(),
                                        resume.getUser().getId(),
                                        actorId,
                                        jobName,
                                        companyName,
                                        updateResumeStatusRequestDto.getStatus().name());

                        emailService.sendResumeStatusNotification(
                                        recipientEmail,
                                        jobName,
                                        companyName,
                                        updateResumeStatusRequestDto.getStatus().name());
                } catch (MessagingException e) {
                        // Log lỗi nhưng vẫn trả về kết quả cập nhật thành công
                        System.err.println("Không thể gửi email thông báo: " + e.getMessage());
                }
                return mapToResponseDto(resume);
        }

        @Override
        public DefaultResumeResponseDto updateResumeStatusForRecruiterCompany(
                        UpdateResumeStatusRequestDto updateResumeStatusRequestDto) {
                String email = SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                                .getName();

                User user = userRepository
                                .findByEmail(email)
                                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));

                if (user.getCompany() == null)
                        throw new EntityNotFoundException("Không tìm thấy công ty người dùng");

                Resume resume = resumeRepository
                                .findById(updateResumeStatusRequestDto.getId())
                                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy resume"));

                Company resumeCompany = resume.getJob().getCompany(); // Sửa lại logic này
                Company currentUserCompany = user.getCompany();

                // Sửa lại logic kiểm tra quyền
                if (resumeCompany == null || currentUserCompany == null ||
                                !resumeCompany.getId().equals(currentUserCompany.getId())) {
                        throw new AccessDeniedException("Không có quyền truy cập");
                }

                resume.setStatus(updateResumeStatusRequestDto.getStatus());
                resumeRepository.save(resume);

                // Gửi email thông báo
                try {
                        String recipientEmail = resume.getUser().getEmail();
                        String jobName = resume.getJob().getName();
                        String companyName = resume.getJob().getCompany().getName();

                        notificationService.notifyResumeStatusUpdated(
                                        resume.getId(),
                                        resume.getUser().getId(),
                                        user.getId(),
                                        jobName,
                                        companyName,
                                        updateResumeStatusRequestDto.getStatus().name());

                        emailService.sendResumeStatusNotification(
                                        recipientEmail,
                                        jobName,
                                        companyName,
                                        updateResumeStatusRequestDto.getStatus().name());
                } catch (MessagingException e) {
                        // Log lỗi nhưng vẫn trả về kết quả cập nhật thành công
                        System.err.println("Không thể gửi email thông báo: " + e.getMessage());
                }

                return mapToResponseDto(resume);
        }

        // @Override
        // public DefaultResumeResponseDto updateResumeStatusForRecruiterCompany(
        // UpdateResumeStatusRequestDto updateResumeStatusRequestDto) {
        // String email = SecurityContextHolder
        // .getContext()
        // .getAuthentication()
        // .getName();
        //
        // User user = userRepository
        // .findByEmail(email)
        // .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));
        //
        // if (user.getCompany() == null)
        // throw new EntityNotFoundException("Không tìm thấy công ty người dùng");
        //
        // Resume resume = resumeRepository
        // .findById(updateResumeStatusRequestDto.getId())
        // .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy resume"));
        //
        // Company resumeCompany = resume.getUser().getCompany();
        // Company currentUserCompany = user.getCompany();
        //
        // if (resumeCompany != null || currentUserCompany != null ||
        // !resumeCompany.getId().equals(currentUserCompany.getId())) {
        // throw new AccessDeniedException("Không có quyền truy cập");
        // }
        // resume.setStatus(updateResumeStatusRequestDto.getStatus());
        // resumeRepository.save(resume);
        // return mapToResponseDto(resume);
        // }

        private String generateKey(String email, Long id, Long version) {
                String safeEmail = email.replaceAll("[^a-zA-Z0-9]", "_");
                String folderName = "resume/" + safeEmail;
                String generatedFileName = "resume-" + id + "-" + version + ".pdf";

                return folderName + "/" + generatedFileName;
        }

        private DefaultResumeResponseDto mapToResponseDto(Resume resume) {
                return new DefaultResumeResponseDto(
                                resume.getId(),
                                resume.getUser().getEmail(),
                                resume.getJob().getName(),
                                resume.getJob().getCompany().getName(),
                                resume.getCreatedAt().toString(),
                                resume.getUpdatedAt().toString());
        }

        private ResumeForDisplayResponseDto mapToResumeForDisplayResponseDto(Resume resume) {
                ResumeForDisplayResponseDto resumeForDisplayResponseDto = new ResumeForDisplayResponseDto();

                resumeForDisplayResponseDto.setId(resume.getId());

                resumeForDisplayResponseDto
                                .setPdfUrl(s3Service.generatePresignedUrl(resume.getFileKey(), Duration.ofMinutes(15)));
                resumeForDisplayResponseDto.setStatus(resume.getStatus().toString());

                ResumeForDisplayResponseDto.User user = new ResumeForDisplayResponseDto.User(
                                resume.getUser().getId(),
                                resume.getUser().getEmail());
                resumeForDisplayResponseDto.setUser(user);

                ResumeForDisplayResponseDto.Job job = new ResumeForDisplayResponseDto.Job(
                                resume.getJob().getId(),
                                resume.getJob().getName(),
                                resume.getJob().getLocation(),
                                resume.getJob().getSkills().stream().map(Skill::getName).toList(),
                                resume.getJob().getLevel(),
                                resume.getJob().getDescription());
                resumeForDisplayResponseDto.setJob(job);

                ResumeForDisplayResponseDto.Company company = new ResumeForDisplayResponseDto.Company(
                                resume.getJob().getCompany().getId(),
                                resume.getJob().getCompany().getName(),
                                resume.getJob().getCompany().getCompanyLogo() != null
                                                ? resume.getJob().getCompany().getCompanyLogo().getLogoUrl()
                                                : null);
                resumeForDisplayResponseDto.setCompany(company);

                resumeForDisplayResponseDto.setCreatedAt(resume.getCreatedAt().toString());
                resumeForDisplayResponseDto.setUpdatedAt(resume.getUpdatedAt().toString());

                return resumeForDisplayResponseDto;
        }

        @Override
        public java.util.Map<String, Long> getResumeStatsByStatus() {
                java.util.Map<String, Long> stats = new java.util.LinkedHashMap<>();
                stats.put("PENDING", resumeRepository.countByStatus(
                                com.TranAn.BackEnd_Works.model.constant.ResumeStatus.PENDING));
                stats.put("REVIEWING", resumeRepository.countByStatus(
                                com.TranAn.BackEnd_Works.model.constant.ResumeStatus.REVIEWING));
                stats.put("APPROVED", resumeRepository.countByStatus(
                                com.TranAn.BackEnd_Works.model.constant.ResumeStatus.APPROVED));
                stats.put("REJECTED", resumeRepository.countByStatus(
                                com.TranAn.BackEnd_Works.model.constant.ResumeStatus.REJECTED));
                return stats;
        }

        @Override
        public java.util.Map<String, Long> getResumeStatsByStatusForRecruiterCompany() {
                String email = SecurityContextHolder.getContext().getAuthentication().getName();
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));

                if (user.getCompany() == null) {
                        throw new EntityNotFoundException("Không tìm thấy công ty của người dùng");
                }

                Long companyId = user.getCompany().getId();
                java.util.Map<String, Long> stats = new java.util.LinkedHashMap<>();
                stats.put("PENDING", resumeRepository.countByStatusAndCompanyId(
                                com.TranAn.BackEnd_Works.model.constant.ResumeStatus.PENDING, companyId));
                stats.put("REVIEWING", resumeRepository.countByStatusAndCompanyId(
                                com.TranAn.BackEnd_Works.model.constant.ResumeStatus.REVIEWING, companyId));
                stats.put("APPROVED", resumeRepository.countByStatusAndCompanyId(
                                com.TranAn.BackEnd_Works.model.constant.ResumeStatus.APPROVED, companyId));
                stats.put("REJECTED", resumeRepository.countByStatusAndCompanyId(
                                com.TranAn.BackEnd_Works.model.constant.ResumeStatus.REJECTED, companyId));
                return stats;
        }

        @Override
        public boolean hasApplied(Long jobId) {
                String email = SecurityContextHolder.getContext().getAuthentication().getName();
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));
                return resumeRepository.existsByUserIdAndJobId(user.getId(), jobId);
        }

}
