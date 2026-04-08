package com.TranAn.BackEnd_Works.service;

import com.TranAn.BackEnd_Works.model.Subscriber;
import jakarta.mail.MessagingException;

public interface EmailService {
    void sendOtpEmail(String toEmail, String otp, String userName);

    void sendJobNotificationForSubscriber(Subscriber subscriber) throws MessagingException;

    void sendJobNotificationManually(String email) throws MessagingException;

    void sendResumeStatusNotification(String recipientEmail, String jobName, String companyName, String newStatus)
            throws MessagingException;
}
