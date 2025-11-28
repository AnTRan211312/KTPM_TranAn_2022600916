package com.TranAn.BackEnd_Works.controller;


import com.TranAn.BackEnd_Works.annotation.ApiMessage;
import com.TranAn.BackEnd_Works.dto.request.subscriber.DefaultSubscriberRequestDto;
import com.TranAn.BackEnd_Works.dto.response.subcriber.DefaultSubscriberResponseDto;
import com.TranAn.BackEnd_Works.service.SubscriberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Subscriber")
@RequestMapping("/subscribers")
@RestController
@RequiredArgsConstructor
public class SubscriberController {
    private final SubscriberService subscriberService;

    @PostMapping("/me")
    @ApiMessage(value = "Tạo subscriber cho người dùng hiện tại")
    @PreAuthorize("hasAuthority('POST /subscribers/me')")
    @Operation(
            summary = "Tạo subscriber cho người dùng hiện tại",
            description = "Yêu cầu quyền: <b>POST /subscribers/me</b>"
    )
    public ResponseEntity<DefaultSubscriberResponseDto> saveSelfSubscriber(
            @Valid @RequestBody DefaultSubscriberRequestDto request
    ){
        return ResponseEntity.ok(subscriberService.saveSelfsubcriber(request));
    }
    @GetMapping("/me")
    @ApiMessage(value = "Lấy subscriber cho người dùng hiện tại")
    @PreAuthorize("hasAuthority('GET /subscribers/me')")
    @Operation(
            summary = "Lấy subscriber cho người dùng hiện tại",
            description = "Yêu cầu quyền: <b>GET /subscribers/me</b>"
    )
    public ResponseEntity<DefaultSubscriberResponseDto> findSelfSubscriber() {
        return ResponseEntity.ok(subscriberService.findSelfsubscriber());
    }
    @PutMapping("/me")
    @ApiMessage(value = "Cập nhật subscriber cho người dùng hiện tại")
    @PreAuthorize("hasAuthority('PUT /subscribers/me')")
    @Operation(
            summary = "Cập nhật subscriber cho người dùng hiện tại",
            description = "Yêu cầu quyền: <b>PUT /subscribers/me</b>"
    )
    public ResponseEntity<DefaultSubscriberResponseDto> updateSelfSubscriber(
            @Valid @RequestBody DefaultSubscriberRequestDto defaultSubscriberRequestDto
    ) {
        return ResponseEntity.ok(subscriberService.updateSelfSubscriber(defaultSubscriberRequestDto));
    }
    @DeleteMapping("/me")
    @ApiMessage(value = "Xóa subscriber cho người dùng hiện tại")
    @PreAuthorize("hasAuthority('DELETE /subscribers/me')")
    @Operation(
            summary = "Xóa subscriber cho người dùng hiện tại",
            description = "Yêu cầu quyền: <b>DELETE /subscribers/me</b>"
    )
    public ResponseEntity<Void> deleteSelfSubscriber() {
        subscriberService.deleteSelfSubscriber();
        return ResponseEntity.noContent().build();
    }

}
