package com.TranAn.BackEnd_Works.controller;

import com.TranAn.BackEnd_Works.annotation.ApiMessage;
import com.TranAn.BackEnd_Works.service.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Mail")
@RestController
@RequiredArgsConstructor
@RequestMapping("/emails")
public class EmailController {
    private final EmailService emailService;

    @PostMapping("/job-recomendation/{email}")
    @ApiMessage(value = "Gửi email gợi ý việc làm")
    @Operation(summary = "Gửi email gợi ý việc làm cho người dùng", description = "Gửi thông báo công việc phù hợp tới email người dùng")
    public ResponseEntity<String> sendEmail(@PathVariable("email") String email) {
        try {
            emailService.sendJobNotificationManually(email);
            return ResponseEntity.ok("Gửi email thành công!");
        } catch (Exception e) {
            return ResponseEntity
                    .status(500)
                    .body("gửi email thất bại" + e.getMessage());
        }
    }
}
