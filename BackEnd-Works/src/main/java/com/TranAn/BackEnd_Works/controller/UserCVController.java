package com.TranAn.BackEnd_Works.controller;

import com.TranAn.BackEnd_Works.annotation.ApiMessage;
import com.TranAn.BackEnd_Works.dto.request.usercv.CreateUserCVRequestDto;
import com.TranAn.BackEnd_Works.dto.request.usercv.UpdateUserCVRequestDto;
import com.TranAn.BackEnd_Works.dto.response.usercv.UserCVResponseDto;
import com.TranAn.BackEnd_Works.dto.response.usercv.UserCVSummaryDto;
import com.TranAn.BackEnd_Works.service.UserCVService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "User CV Builder")
@RestController
@RequestMapping("/user-cvs")
@RequiredArgsConstructor
public class UserCVController {

    private final UserCVService userCVService;

    @PostMapping
    @ApiMessage(value = "Tạo CV mới")
    @PreAuthorize("hasAuthority('POST /chat-message')")
    @Operation(summary = "Tạo CV mới", description = "Tạo một CV mới cho user hiện tại. Yêu cầu đăng nhập.")
    public ResponseEntity<UserCVResponseDto> createCV(
            @Valid @RequestBody CreateUserCVRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userCVService.createCV(request));
    }

    @PutMapping
    @ApiMessage(value = "Cập nhật CV")
    @PreAuthorize("hasAuthority('POST /chat-message')")
    @Operation(summary = "Cập nhật CV", description = "Cập nhật thông tin CV. Yêu cầu đăng nhập và là chủ sở hữu CV.")
    public ResponseEntity<UserCVResponseDto> updateCV(
            @Valid @RequestBody UpdateUserCVRequestDto request) {
        return ResponseEntity.ok(userCVService.updateCV(request));
    }

    @GetMapping
    @ApiMessage(value = "Lấy danh sách CV của tôi")
    @PreAuthorize("hasAuthority('POST /chat-message')")
    @Operation(summary = "Lấy danh sách CV", description = "Lấy tất cả CV của user hiện tại (không bao gồm cvData để giảm tải).")
    public ResponseEntity<List<UserCVSummaryDto>> getMyCVs() {
        return ResponseEntity.ok(userCVService.getMyCVs());
    }

    @GetMapping("/{id}")
    @ApiMessage(value = "Lấy chi tiết CV")
    @PreAuthorize("hasAuthority('POST /chat-message')")
    @Operation(summary = "Lấy chi tiết CV", description = "Lấy đầy đủ thông tin CV bao gồm cvData.")
    public ResponseEntity<UserCVResponseDto> getCVById(@PathVariable Long id) {
        return ResponseEntity.ok(userCVService.getCVById(id));
    }

    @DeleteMapping("/{id}")
    @ApiMessage(value = "Xóa CV")
    @PreAuthorize("hasAuthority('POST /chat-message')")
    @Operation(summary = "Xóa CV", description = "Xóa CV theo ID. Yêu cầu là chủ sở hữu CV.")
    public ResponseEntity<Void> deleteCV(@PathVariable Long id) {
        userCVService.deleteCV(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/set-default")
    @ApiMessage(value = "Đặt CV làm mặc định")
    @PreAuthorize("hasAuthority('POST /chat-message')")
    @Operation(summary = "Đặt CV làm mặc định", description = "Đặt CV này làm mặc định khi ứng tuyển.")
    public ResponseEntity<UserCVResponseDto> setDefaultCV(@PathVariable Long id) {
        return ResponseEntity.ok(userCVService.setDefaultCV(id));
    }

    @GetMapping("/count")
    @ApiMessage(value = "Đếm số CV")
    @PreAuthorize("hasAuthority('POST /chat-message')")
    @Operation(summary = "Đếm số CV", description = "Đếm số lượng CV của user hiện tại.")
    public ResponseEntity<Long> countMyCVs() {
        return ResponseEntity.ok(userCVService.countMyCVs());
    }

    // SSE Streaming endpoint for AI CV suggestions
    @PostMapping(value = "/ai-suggest", produces = org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE)
    @PreAuthorize("hasAuthority('POST /chat-message')")
    @Operation(summary = "Gợi ý CV với SSE streaming", description = "Stream gợi ý tối ưu hóa CV từ AI.")
    public reactor.core.publisher.Flux<String> generateAiSuggestion(@RequestBody String cvData) {
        return userCVService.generateAiSuggestion(cvData);
    }
}
