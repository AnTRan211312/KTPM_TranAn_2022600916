package com.TranAn.BackEnd_Works.service;

import com.TranAn.BackEnd_Works.dto.response.payment.PaymentStatusResponse;
import com.TranAn.BackEnd_Works.dto.response.payment.PaymentUrlResponse;

import java.util.Map;

public interface VnPayService {

    /**
     * Create a VNPay payment URL for viewing job applicants
     * 
     * @param jobId  Job ID to view applicants
     * @param userId Current user ID
     * @return Payment URL and order ID
     */
    PaymentUrlResponse createPaymentUrl(Long jobId, Long userId);

    /**
     * Process VNPay payment return callback
     * 
     * @param params Query parameters from VNPay
     * @return jobId if payment successful, null otherwise
     */
    Long processPaymentReturn(Map<String, String> params);

    /**
     * Check if user has paid to view job applicants
     * 
     * @param userId User ID
     * @param jobId  Job ID
     * @return Payment status with applicant count if paid
     */
    PaymentStatusResponse checkPaymentStatus(Long userId, Long jobId);
}
