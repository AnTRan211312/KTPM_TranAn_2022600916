package com.TranAn.BackEnd_Works.service.impl;

import com.TranAn.BackEnd_Works.advice.exception.InvalidRequestException;
import com.TranAn.BackEnd_Works.config.payment.VnPayConfig;
import com.TranAn.BackEnd_Works.dto.response.payment.PaymentStatusResponse;
import com.TranAn.BackEnd_Works.dto.response.payment.PaymentUrlResponse;
import com.TranAn.BackEnd_Works.model.Job;
import com.TranAn.BackEnd_Works.model.Payment;
import com.TranAn.BackEnd_Works.model.User;
import com.TranAn.BackEnd_Works.repository.JobRepository;
import com.TranAn.BackEnd_Works.repository.PaymentRepository;
import com.TranAn.BackEnd_Works.repository.ResumeRepository;
import com.TranAn.BackEnd_Works.repository.UserRepository;
import com.TranAn.BackEnd_Works.service.VnPayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class VnPayServiceImpl implements VnPayService {

    private final VnPayConfig vnPayConfig;
    private final PaymentRepository paymentRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;

    private static final long PAYMENT_AMOUNT = 10000L; // 10,000 VND

    @Override
    @Transactional
    public PaymentUrlResponse createPaymentUrl(Long jobId, Long userId) {
        // Check if already paid
        if (paymentRepository.existsByUserIdAndJobIdAndPaymentStatus(userId, jobId, Payment.PaymentStatus.SUCCESS)) {
            throw new InvalidRequestException("Bạn đã thanh toán để xem thông tin này rồi");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new InvalidRequestException("Không tìm thấy công việc"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidRequestException("Không tìm thấy người dùng"));

        // Generate unique order ID
        String orderId = UUID.randomUUID().toString().replace("-", "").substring(0, 20);
        String orderInfo = "Thanh toan xem so nguoi ung tuyen job " + job.getId();

        // Create pending payment record
        Payment payment = Payment.builder()
                .user(user)
                .job(job)
                .amount(PAYMENT_AMOUNT)
                .orderId(orderId)
                .orderInfo(orderInfo)
                .paymentStatus(Payment.PaymentStatus.PENDING)
                .build();
        paymentRepository.save(payment);

        // Build VNPay payment URL
        String paymentUrl = buildPaymentUrl(orderId, PAYMENT_AMOUNT, orderInfo);

        return PaymentUrlResponse.builder()
                .paymentUrl(paymentUrl)
                .orderId(orderId)
                .build();
    }

    private String buildPaymentUrl(String orderId, long amount, String orderInfo) {
        Map<String, String> vnpParams = new HashMap<>();

        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", vnPayConfig.getVnpTmnCode());
        vnpParams.put("vnp_Amount", String.valueOf(amount * 100));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", orderId);
        vnpParams.put("vnp_OrderInfo", orderInfo);
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", vnPayConfig.getVnpReturnUrl());
        vnpParams.put("vnp_IpAddr", "127.0.0.1");

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnpCreateDate = formatter.format(cld.getTime());
        vnpParams.put("vnp_CreateDate", vnpCreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnpExpireDate = formatter.format(cld.getTime());
        vnpParams.put("vnp_ExpireDate", vnpExpireDate);

        List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();

        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnpParams.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // Build hash data with URL encoded values
                hashData.append(fieldName);
                hashData.append('=');
                try {
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    // Build query
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                } catch (Exception e) {
                    e.printStackTrace();
                }
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = query.toString();
        String vnpSecureHash = vnPayConfig.hmacSHA512(vnPayConfig.getVnpHashSecret(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnpSecureHash;

        return vnPayConfig.getVnpPayUrl() + "?" + queryUrl;
    }

    @Override
    @Transactional
    public Long processPaymentReturn(Map<String, String> params) {
        String vnpSecureHash = params.get("vnp_SecureHash");

        // Remove hash params for verification
        Map<String, String> vnpParams = new HashMap<>(params);
        vnpParams.remove("vnp_SecureHash");
        vnpParams.remove("vnp_SecureHashType");

        // Sort and build hash data
        List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnpParams.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                try {
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    if (itr.hasNext()) {
                        hashData.append('&');
                    }
                } catch (Exception e) {
                    log.error("Error encoding field: {}", fieldName, e);
                }
            }
        }

        String calculatedHash = vnPayConfig.hmacSHA512(vnPayConfig.getVnpHashSecret(), hashData.toString());

        log.info("Received hash: {}", vnpSecureHash);
        log.info("Calculated hash: {}", calculatedHash);

        if (!calculatedHash.equalsIgnoreCase(vnpSecureHash)) {
            log.warn("Invalid VNPay signature");
            return null;
        }

        String orderId = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        String transactionNo = params.get("vnp_TransactionNo");

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElse(null);

        if (payment == null) {
            log.warn("Payment not found for order: {}", orderId);
            return null;
        }

        if ("00".equals(responseCode)) {
            payment.setPaymentStatus(Payment.PaymentStatus.SUCCESS);
            payment.setTransactionNo(transactionNo);
            payment.setPaidAt(LocalDateTime.now());
            paymentRepository.save(payment);
            log.info("Payment successful for order: {}", orderId);
            return payment.getJob().getId();
        } else {
            payment.setPaymentStatus(Payment.PaymentStatus.FAILED);
            paymentRepository.save(payment);
            log.warn("Payment failed for order: {} with code: {}", orderId, responseCode);
            return null;
        }
    }

    @Override
    public PaymentStatusResponse checkPaymentStatus(Long userId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new InvalidRequestException("Không tìm thấy công việc"));

        boolean paid = paymentRepository.existsByUserIdAndJobIdAndPaymentStatus(
                userId, jobId, Payment.PaymentStatus.SUCCESS);

        if (paid) {
            long applicantCount = resumeRepository.countByJobId(jobId);
            return PaymentStatusResponse.builder()
                    .paid(true)
                    .applicantCount(applicantCount)
                    .jobName(job.getName())
                    .build();
        }

        return PaymentStatusResponse.builder()
                .paid(false)
                .applicantCount(null)
                .jobName(job.getName())
                .build();
    }
}
