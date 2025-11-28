import axiosClient from "@/lib/axiosClient";
import type { ApiResponse } from "@/types/apiResponse.d.ts";
import type { DashboardStatsResponseDto } from "@/types/adminDashboard.d.ts";

/**
 * Lấy thống kê tổng quan cho admin dashboard
 * Yêu cầu quyền: GET /admin/dashboard/stats
 */
export const getDashboardStats = () => {
  return axiosClient.get<ApiResponse<DashboardStatsResponseDto>>(
    "/admin/dashboard/stats",
  );
};

