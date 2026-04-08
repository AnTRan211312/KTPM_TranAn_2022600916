package com.TranAn.BackEnd_Works.service.impl;

import com.TranAn.BackEnd_Works.dto.email.JobMailDto;
import com.TranAn.BackEnd_Works.model.Job;
import com.TranAn.BackEnd_Works.model.Subscriber;
import com.TranAn.BackEnd_Works.repository.JobRepository;
import com.TranAn.BackEnd_Works.repository.SubscriberRepository;
import com.TranAn.BackEnd_Works.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    private final JobRepository jobRepository;
    private final SubscriberRepository subscriberRepository;
    @Value("${mail.from}")
    private String sender;

    @Override
    @Async
    public void sendOtpEmail(String toEmail, String otp, String userName) {
        try {
            // Tạo context cho Thymeleaf
            Context context = new Context();
            context.setVariable("userName", userName);
            context.setVariable("otp", otp);

            // Process template
            String html = templateEngine.process("otp-email.html", context);

            // Tạo và gửi email
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(sender);
            helper.setTo(toEmail);
            helper.setSubject("🔐 Mã OTP Khôi Phục Mật Khẩu - TalentBridge");
            helper.setText(html, true);

            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            throw new RuntimeException("Không thể gửi email: " + e.getMessage());
        }
    }

    @Override
    public void sendJobNotificationForSubscriber(Subscriber subscriber) throws MessagingException {
        List<String> skillNames = subscriber.getSkills().stream()
                .map(skill -> skill.getName())
                .toList();

        List<Job> jobs = jobRepository.findDistinctTop3BySkills_NameInOrderByCreatedAtDesc(skillNames);

        List<JobMailDto> jobMailDtos = jobs.stream()
                .map(this::mapToEmailJobInform)
                .toList();

        Context context = new Context();
        context.setVariable("jobs", jobMailDtos);
        String html = templateEngine.process("job-notification-email.html", context);

        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
        helper.setFrom(sender);
        helper.setTo(subscriber.getEmail());
        helper.setSubject("🔥 Cơ hội việc làm mới dành cho bạn!");
        helper.setText(html, true);

        mailSender.send(mimeMessage);
    }

    @Override
    public void sendJobNotificationManually(String email) throws MessagingException {
        Subscriber subscriber = subscriberRepository
                .findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));

        sendJobNotificationForSubscriber(subscriber);
    }

    @Override
    @Async
    public void sendResumeStatusNotification(String recipientEmail, String jobName, String companyName,
            String newStatus) throws MessagingException {
        try {
            // Map status sang tiếng Việt và màu sắc tương ứng
            StatusInfo statusInfo = mapStatusToInfo(newStatus);

            // Tạo context cho Thymeleaf
            Context context = new Context();
            context.setVariable("jobName", jobName);
            context.setVariable("companyName", companyName);
            context.setVariable("statusText", statusInfo.text);
            context.setVariable("statusColor", statusInfo.color);
            context.setVariable("statusIcon", statusInfo.icon);
            context.setVariable("message", statusInfo.message);

            // Process template
            String html = templateEngine.process("resume-status-notification.html", context);

            // Tạo và gửi email
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(sender);
            helper.setTo(recipientEmail);
            helper.setSubject("📋 Cập nhật trạng thái ứng tuyển - " + jobName);
            helper.setText(html, true);

            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            throw new MessagingException("Không thể gửi email thông báo: " + e.getMessage(), e);
        }
    }

    private StatusInfo mapStatusToInfo(String status) {
        return switch (status.toUpperCase()) {
            case "PENDING" -> new StatusInfo(
                    "Đang xem xét",
                    "#FFA500",
                    "⏳",
                    "Hồ sơ của bạn đang được xem xét bởi nhà tuyển dụng.");
            case "REVIEWING" -> new StatusInfo(
                    "Đang đánh giá",
                    "#2196F3",
                    "👀",
                    "Nhà tuyển dụng đang đánh giá chi tiết hồ sơ của bạn.");
            case "APPROVED" -> new StatusInfo(
                    "Được chấp nhận",
                    "#4CAF50",
                    "✅",
                    "Chúc mừng! Hồ sơ của bạn đã được chấp nhận. Nhà tuyển dụng sẽ liên hệ với bạn sớm.");
            case "REJECTED" -> new StatusInfo(
                    "Không phù hợp",
                    "#F44336",
                    "❌",
                    "Rất tiếc, lần này hồ sơ của bạn chưa phù hợp với vị trí này. Đừng nản chí, hãy tiếp tục tìm kiếm cơ hội khác!");
            default -> new StatusInfo(
                    status,
                    "#666666",
                    "📌",
                    "Trạng thái hồ sơ của bạn đã được cập nhật.");
        };
    }

    // Inner class để lưu thông tin status
    private record StatusInfo(String text, String color, String icon, String message) {
    }

    private JobMailDto mapToEmailJobInform(Job job) {
        String applyUrl = "http://localhost:3000/jobs/" + job.getId();

        JobMailDto jobMailDto = new JobMailDto(job.getId(), job.getName(), job.getSalary(), applyUrl);

        if (job.getCompany() != null) {
            JobMailDto.CompanyDto companyDto = new JobMailDto.CompanyDto(
                    job.getCompany().getId(),
                    job.getCompany().getName(),
                    job.getCompany().getAddress());
            jobMailDto.setCompany(companyDto);
        }

        if (job.getSkills() != null) {
            List<JobMailDto.SkillDto> skillDto = job
                    .getSkills()
                    .stream()
                    .map(x -> new JobMailDto.SkillDto(x.getId(), x.getName()))
                    .toList();
            jobMailDto.setSkills(skillDto);
        }

        return jobMailDto;
    }
}
