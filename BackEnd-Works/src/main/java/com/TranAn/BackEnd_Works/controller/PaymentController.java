package com.TranAn.BackEnd_Works.controller;

import com.TranAn.BackEnd_Works.annotation.ApiMessage;
import com.TranAn.BackEnd_Works.dto.request.payment.CreatePaymentRequest;
import com.TranAn.BackEnd_Works.dto.response.payment.PaymentStatusResponse;
import com.TranAn.BackEnd_Works.dto.response.payment.PaymentUrlResponse;
import com.TranAn.BackEnd_Works.service.AuthService;
import com.TranAn.BackEnd_Works.service.VnPayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.Map;

@Tag(name = "Payment")
@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final VnPayService vnPayService;
    private final AuthService authService;

    /**
     * Create VNPay payment URL for viewing job applicants
     */
    @PostMapping("/create")
    @ApiMessage(value = "Tạo URL thanh toán VNPay")
    @Operation(summary = "Tạo URL thanh toán VNPay", description = "Tạo URL thanh toán để xem danh sách ứng viên của công việc")
    public ResponseEntity<PaymentUrlResponse> createPayment(
            @RequestBody CreatePaymentRequest request) {

        Long userId = authService.getCurrentUser().getId();
        PaymentUrlResponse response = vnPayService.createPaymentUrl(request.getJobId(), userId);

        return ResponseEntity.ok(response);
    }

    /**
     * VNPay payment return callback
     * This endpoint handles the redirect from VNPay after payment
     */
    @GetMapping("/vnpay-return")
    @ApiMessage(value = "Xử lý callback từ VNPay")
    @Operation(summary = "Xử lý callback từ VNPay", description = "Endpoint xử lý redirect từ VNPay sau khi thanh toán")
    @SecurityRequirements()
    public RedirectView vnpayReturn(@RequestParam Map<String, String> allParams) {
        log.info("VNPay return callback received: {}", allParams);

        Long jobId = vnPayService.processPaymentReturn(allParams);

        String frontendUrl = "http://localhost:3000";
        String redirectUrl;

        if (jobId != null) {
            // Payment successful - redirect to job detail page with success flag
            redirectUrl = frontendUrl + "/jobs/" + jobId + "?paymentSuccess=true";
        } else {
            // Payment failed - redirect to payment result page
            String orderId = allParams.get("vnp_TxnRef");
            redirectUrl = frontendUrl + "/payment/result?success=false&orderId=" + orderId;
        }

        return new RedirectView(redirectUrl);
    }

    /**
     * Check if user has paid for viewing job applicants
     */
    @GetMapping("/check/{jobId}")
    @ApiMessage(value = "Kiểm tra trạng thái thanh toán")
    @Operation(summary = "Kiểm tra trạng thái thanh toán", description = "Kiểm tra người dùng đã thanh toán để xem ứng viên của công việc chưa")
    public ResponseEntity<PaymentStatusResponse> checkPaymentStatus(
            @PathVariable Long jobId) {

        Long userId = authService.getCurrentUser().getId();
        PaymentStatusResponse response = vnPayService.checkPaymentStatus(userId, jobId);

        return ResponseEntity.ok(response);
    }
}
