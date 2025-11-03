//package com.TranAn.BackEnd_Works.controller;
//
//
//
//import com.TranAn.BackEnd_Works.annotation.ApiMessage;
//import com.TranAn.BackEnd_Works.service.AdminDashboardService;
//import io.swagger.v3.oas.annotations.Operation;
//import io.swagger.v3.oas.annotations.tags.Tag;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//@Tag(name = "Admin Dashboard")
//@RestController
//@RequestMapping("/admin")
//@RequiredArgsConstructor
//public class AdminDashboardController {
//
//    private final AdminDashboardService adminDashboardService;
//
//    @GetMapping("/stats")
//    @ApiMessage("Lấy thống kê dashboard")
//    @PreAuthorize("hasAuthority('GET /admin/dashboard/stats')")
//    @Operation(
//            summary = "Lấy thống kê tổng quan cho admin dashboard",
//            description = "Yêu cầu quyền: <b>GET /admin/dashboard/stats</b>"
//    )
//    public ResponseEntity<?> getDashboardStats() {
//        return ResponseEntity.ok(adminDashboardService.getDashboardStats());
//    }
//}
