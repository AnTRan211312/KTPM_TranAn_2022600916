//package com.TranAn.BackEnd_Works.dto.admin;
//
//
//
//import lombok.AllArgsConstructor;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//
//import java.util.List;
//
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class DashboardStatsResponseDto {
//    // Thống kê tổng quan
//    private OverviewStats overviewStats;
//
//    // Thống kê người dùng
//    private UserStats userStats;
//
//    // Thống kê công việc
//    private JobStats jobStats;
//
//    // Thống kê resume/ứng tuyển
//    private ResumeStats resumeStats;
//
//    // Thống kê công ty
//    private CompanyStats companyStats;
//
//    // Biểu đồ theo thời gian
//    private ChartData chartData;
//
//    // Top performers
//    private TopPerformers topPerformers;
//
//    @Data
//    @NoArgsConstructor
//    @AllArgsConstructor
//    public static class OverviewStats {
//        private Long totalUsers;
//        private Long totalJobs;
//        private Long totalResumes;
//        private Long totalCompanies;
//        private Long totalSubscribers;
//
//        // So sánh với tháng trước (%)
//        private Double userGrowthRate;
//        private Double jobGrowthRate;
//        private Double resumeGrowthRate;
//    }
//
//    @Data
//    @NoArgsConstructor
//    @AllArgsConstructor
//    public static class UserStats {
//        private Long totalUsers;
//        private Long activeUsers; // Users đã login trong 30 ngày
//        private Long newUsersThisMonth;
//        private Long usersByRole; // Có thể mở rộng thành Map<String, Long>
//
//        // Phân bố theo role
//        private Long adminCount;
//        private Long hrCount;
//        private Long userCount;
//    }
//
//    @Data
//    @NoArgsConstructor
//    @AllArgsConstructor
//    public static class JobStats {
//        private Long totalJobs;
//        private Long activeJobs;
//        private Long expiredJobs;
//        private Long newJobsThisMonth;
//
//        // Top skills được yêu cầu nhiều nhất
//        private List<SkillCount> topSkills;
//
//        // Phân bố theo level
//        private Long internJobs;
//        private Long fresherJobs;
//        private Long juniorJobs;
//        private Long middleJobs;
//        private Long seniorJobs;
//        private Long leaderJobs;
//    }
//
//    @Data
//    @NoArgsConstructor
//    @AllArgsConstructor
//    public static class ResumeStats {
//        private Long totalResumes;
//        private Long pendingResumes;
//        private Long reviewingResumes;
//        private Long approvedResumes;
//        private Long rejectedResumes;
//
//        // Tỷ lệ chấp nhận
//        private Double approvalRate;
//
//        // Resume mới trong tháng
//        private Long newResumesThisMonth;
//    }
//
//    @Data
//    @NoArgsConstructor
//    @AllArgsConstructor
//    public static class CompanyStats {
//        private Long totalCompanies;
//        private Long activeCompanies; // Công ty có job đang active
//        private Long newCompaniesThisMonth;
//
//        // Top công ty có nhiều job nhất
//        private List<CompanyJobCount> topCompanies;
//    }
//
//    @Data
//    @NoArgsConstructor
//    @AllArgsConstructor
//    public static class ChartData {
//        // Dữ liệu cho biểu đồ users theo tháng
//        private List<MonthlyData> usersByMonth;
//
//        // Dữ liệu cho biểu đồ jobs theo tháng
//        private List<MonthlyData> jobsByMonth;
//
//        // Dữ liệu cho biểu đồ resumes theo tháng
//        private List<MonthlyData> resumesByMonth;
//    }
//
//    @Data
//    @NoArgsConstructor
//    @AllArgsConstructor
//    public static class TopPerformers {
//        // Top công ty có nhiều ứng viên nhất
//        private List<CompanyResumeCount> topCompaniesByResumes;
//
//        // Top job có nhiều ứng viên nhất
//        private List<JobResumeCount> topJobsByResumes;
//
//        // Top skills phổ biến
//        private List<SkillCount> topSkills;
//    }
//
//    // Helper classes
//    @Data
//    @NoArgsConstructor
//    @AllArgsConstructor
//    public static class SkillCount {
//        private String skillName;
//        private Long count;
//    }
//
//    @Data
//    @NoArgsConstructor
//    @AllArgsConstructor
//    public static class CompanyJobCount {
//        private Long companyId;
//        private String companyName;
//        private Long jobCount;
//    }
//
//    @Data
//    @NoArgsConstructor
//    @AllArgsConstructor
//    public static class CompanyResumeCount {
//        private Long companyId;
//        private String companyName;
//        private Long resumeCount;
//    }
//
//    @Data
//    @NoArgsConstructor
//    @AllArgsConstructor
//    public static class JobResumeCount {
//        private Long jobId;
//        private String jobName;
//        private String companyName;
//        private Long resumeCount;
//    }
//
//    @Data
//    @NoArgsConstructor
//    @AllArgsConstructor
//    public static class MonthlyData {
//        private String month; // "2024-01", "2024-02", ...
//        private Long count;
//    }
//}