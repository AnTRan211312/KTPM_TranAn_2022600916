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
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Mã OTP Khôi Phục Mật Khẩu");

            String htmlContent = buildOtpEmailTemplate(otp, userName);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Không thể gửi email: " + e.getMessage());
        }
    }

    public String buildOtpEmailTemplate(String otp, String userName) {
        String template = """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                        background: linear-gradient(135deg, #fef3e2 0%%, #fff5e6 50%%, #ffe8cc 100%%);
                        margin: 0; 
                        padding: 40px 20px; 
                    }
                    .email-wrapper {
                        max-width: 600px;
                        margin: 0 auto;
                        background: #ffffff;
                        border-radius: 16px;
                        overflow: hidden;
                        box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                    }
                    .header-gradient {
                        background: linear-gradient(135deg, #f97316 0%%, #ea580c 50%%, #fbbf24 100%%);
                        padding: 40px 30px;
                        text-align: center;
                        color: #ffffff;
                    }
                    .header-gradient h1 {
                        font-size: 28px;
                        font-weight: 700;
                        margin-bottom: 10px;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    }
                    .header-gradient p {
                        font-size: 16px;
                        opacity: 0.95;
                    }
                    .content {
                        padding: 40px 30px;
                        background: #ffffff;
                    }
                    .greeting {
                        font-size: 18px;
                        color: #1f2937;
                        margin-bottom: 20px;
                        line-height: 1.6;
                    }
                    .greeting strong {
                        color: #f97316;
                        font-weight: 600;
                    }
                    .info-text {
                        color: #4b5563;
                        font-size: 16px;
                        line-height: 1.7;
                        margin-bottom: 30px;
                    }
                    .otp-container {
                        background: linear-gradient(135deg, #fef3e2 0%%, #fff5e6 100%%);
                        border: 2px dashed #f97316;
                        border-radius: 12px;
                        padding: 30px 20px;
                        text-align: center;
                        margin: 30px 0;
                    }
                    .otp-label {
                        font-size: 14px;
                        color: #6b7280;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        margin-bottom: 15px;
                        font-weight: 600;
                    }
                    .otp-code {
                        font-size: 42px;
                        font-weight: 800;
                        color: #f97316;
                        letter-spacing: 8px;
                        font-family: 'Courier New', monospace;
                        text-shadow: 0 2px 4px rgba(249, 115, 22, 0.2);
                    }
                    .expiry-info {
                        background: #eff6ff;
                        border-left: 4px solid #3b82f6;
                        padding: 15px 20px;
                        border-radius: 8px;
                        margin: 25px 0;
                    }
                    .expiry-info p {
                        color: #1e40af;
                        font-size: 15px;
                        line-height: 1.6;
                    }
                    .expiry-info strong {
                        color: #1e3a8a;
                    }
                    .warning-box {
                        background: #fef2f2;
                        border-left: 4px solid #ef4444;
                        padding: 18px 20px;
                        border-radius: 8px;
                        margin: 25px 0;
                    }
                    .warning-box p {
                        color: #991b1b;
                        font-size: 14px;
                        line-height: 1.6;
                        font-weight: 500;
                    }
                    .footer {
                        background: #f9fafb;
                        padding: 25px 30px;
                        text-align: center;
                        border-top: 1px solid #e5e7eb;
                    }
                    .footer p {
                        color: #6b7280;
                        font-size: 13px;
                        line-height: 1.6;
                        margin: 5px 0;
                    }
                    .footer .brand {
                        color: #f97316;
                        font-weight: 600;
                        font-size: 16px;
                        margin-bottom: 10px;
                    }
                    .divider {
                        height: 1px;
                        background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
                        margin: 25px 0;
                    }
                </style>
            </head>
            <body>
                <div class="email-wrapper">
                    <div class="header-gradient">
                        <h1>🔐 Khôi Phục Mật Khẩu</h1>
                        <p>TalentBridge - Hệ thống tuyển dụng IT</p>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">
                            Xin chào <strong>%s</strong>,
                        </div>
                        
                        <p class="info-text">
                            Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn. 
                            Dưới đây là mã OTP để xác thực:
                        </p>
                        
                        <div class="otp-container">
                            <div class="otp-label">Mã OTP của bạn</div>
                            <div class="otp-code">%s</div>
                        </div>
                        
                        <div class="expiry-info">
                            <p>
                                ⏰ Mã OTP này có hiệu lực trong <strong>5 phút</strong> kể từ khi nhận được email.
                            </p>
                            <p style="margin-top: 8px;">
                                📝 Vui lòng nhập mã này vào trang khôi phục mật khẩu để tiếp tục.
                            </p>
                        </div>
                        
                        <div class="divider"></div>
                        
                        <div class="warning-box">
                            <p>
                                ⚠️ <strong>Lưu ý bảo mật:</strong> Nếu bạn không yêu cầu khôi phục mật khẩu, 
                                vui lòng bỏ qua email này và kiểm tra tài khoản của bạn ngay lập tức.
                            </p>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p class="brand">TalentBridge</p>
                        <p>Email này được gửi tự động từ hệ thống, vui lòng không trả lời email này.</p>
                        <p style="margin-top: 10px;">&copy; 2024 TalentBridge. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """;
        return template.formatted(userName, otp);
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
    public void sendResumeStatusNotification(String recipientEmail, String jobName, String companyName, String newStatus) throws MessagingException {
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
                    "Hồ sơ của bạn đang được xem xét bởi nhà tuyển dụng."
            );
            case "REVIEWING" -> new StatusInfo(
                    "Đang đánh giá",
                    "#2196F3",
                    "👀",
                    "Nhà tuyển dụng đang đánh giá chi tiết hồ sơ của bạn."
            );
            case "APPROVED" -> new StatusInfo(
                    "Được chấp nhận",
                    "#4CAF50",
                    "✅",
                    "Chúc mừng! Hồ sơ của bạn đã được chấp nhận. Nhà tuyển dụng sẽ liên hệ với bạn sớm."
            );
            case "REJECTED" -> new StatusInfo(
                    "Không phù hợp",
                    "#F44336",
                    "❌",
                    "Rất tiếc, lần này hồ sơ của bạn chưa phù hợp với vị trí này. Đừng nản chí, hãy tiếp tục tìm kiếm cơ hội khác!"
            );
            default -> new StatusInfo(
                    status,
                    "#666666",
                    "📌",
                    "Trạng thái hồ sơ của bạn đã được cập nhật."
            );
        };
    }

    // Inner class để lưu thông tin status
    private record StatusInfo(String text, String color, String icon, String message) {}

    private JobMailDto mapToEmailJobInform(Job job) {
        String applyUrl = "http://localhost:3000/jobs/" + job.getId();

        JobMailDto jobMailDto = new JobMailDto(job.getId(), job.getName(), job.getSalary(), applyUrl);

        if (job.getCompany() != null) {
            JobMailDto.CompanyDto companyDto =
                    new JobMailDto.CompanyDto(
                            job.getCompany().getId(),
                            job.getCompany().getName(),
                            job.getCompany().getAddress()
                    );
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
