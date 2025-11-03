//package com.TranAn.BackEnd_Works.service.impl;
//
//
//import com.TranAn.BackEnd_Works.dto.admin.DashboardStatsResponseDto;
//import com.TranAn.BackEnd_Works.model.constant.ResumeStatus;
//import com.TranAn.BackEnd_Works.repository.*;
//import com.TranAn.BackEnd_Works.service.AdminDashboardService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//import java.time.LocalDateTime;
//import java.time.YearMonth;
//import java.time.format.DateTimeFormatter;
//import java.util.ArrayList;
//import java.util.List;
//import java.util.stream.Collectors;
//
//@Service
//@RequiredArgsConstructor
//public class AdminDashboardServiceImpl implements AdminDashboardService {
//
//    private final UserRepository userRepository;
//    private final JobRepository jobRepository;
//    private final ResumeRepository resumeRepository;
//    private final CompanyRepository companyRepository;
//    private final SubscriberRepository subscriberRepository;
//    private final SkillRepository skillRepository;
//
//    @Override
//    public DashboardStatsResponseDto getDashboardStats() {
//        DashboardStatsResponseDto response = new DashboardStatsResponseDto();
//
//        response.setOverviewStats(getOverviewStats());
//        response.setUserStats(getUserStats());
//        response.setJobStats(getJobStats());
//        response.setResumeStats(getResumeStats());
//        response.setCompanyStats(getCompanyStats());
//        response.setChartData(getChartData());
//        response.setTopPerformers(getTopPerformers());
//
//        return response;
//    }
//
//    private DashboardStatsResponseDto.OverviewStats getOverviewStats() {
//        LocalDateTime startOfThisMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
//        LocalDateTime startOfLastMonth = startOfThisMonth.minusMonths(1);
//
//        Long totalUsers = userRepository.count();
//        Long totalJobs = jobRepository.count();
//        Long totalResumes = resumeRepository.count();
//        Long totalCompanies = companyRepository.count();
//        Long totalSubscribers = subscriberRepository.count();
//
//        // Tính growth rate
//        Long usersThisMonth = userRepository.countByCreatedAtAfter(startOfThisMonth);
//        Long usersLastMonth = userRepository.countByCreatedAtBetween(startOfLastMonth, startOfThisMonth);
//        Double userGrowthRate = calculateGrowthRate(usersThisMonth, usersLastMonth);
//
//        Long jobsThisMonth = jobRepository.countByCreatedAtAfter(startOfThisMonth);
//        Long jobsLastMonth = jobRepository.countByCreatedAtBetween(startOfLastMonth, startOfThisMonth);
//        Double jobGrowthRate = calculateGrowthRate(jobsThisMonth, jobsLastMonth);
//
//        Long resumesThisMonth = resumeRepository.countByCreatedAtAfter(startOfThisMonth);
//        Long resumesLastMonth = resumeRepository.countByCreatedAtBetween(startOfLastMonth, startOfThisMonth);
//        Double resumeGrowthRate = calculateGrowthRate(resumesThisMonth, resumesLastMonth);
//
//        return new DashboardStatsResponseDto.OverviewStats(
//                totalUsers,
//                totalJobs,
//                totalResumes,
//                totalCompanies,
//                totalSubscribers,
//                userGrowthRate,
//                jobGrowthRate,
//                resumeGrowthRate
//        );
//    }
//
//    private DashboardStatsResponseDto.UserStats getUserStats() {
//        Long totalUsers = userRepository.count();
//
//        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
//        Long activeUsers = userRepository.countByLastLoginAfter(thirtyDaysAgo); // Cần thêm field lastLogin trong User
//
//        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
//        Long newUsersThisMonth = userRepository.countByCreatedAtAfter(startOfMonth);
//
//        // Đếm theo role - cần customize theo role của bạn
//        Long adminCount = userRepository.countByRole_Name("ADMIN");
//        Long hrCount = userRepository.countByRole_Name("HR");
//        Long userCount = userRepository.countByRole_Name("USER");
//
//        return new DashboardStatsResponseDto.UserStats(
//                totalUsers,
//                activeUsers,
//                newUsersThisMonth,
//                0L, // usersByRole - có thể bỏ hoặc customize
//                adminCount,
//                hrCount,
//                userCount
//        );
//    }
//
//    private DashboardStatsResponseDto.JobStats getJobStats() {
//        Long totalJobs = jobRepository.count();
//
//        LocalDateTime now = LocalDateTime.now();
//        Long activeJobs = jobRepository.countByEndDateAfter(now);
//        Long expiredJobs = jobRepository.countByEndDateBefore(now);
//
//        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
//        Long newJobsThisMonth = jobRepository.countByCreatedAtAfter(startOfMonth);
//
//        // Top skills - cần thêm query method
//        List<DashboardStatsResponseDto.SkillCount> topSkills = skillRepository.findTopSkillsByJobCount(10)
//                .stream()
//                .map(obj -> new DashboardStatsResponseDto.SkillCount((String) obj[0], (Long) obj[1]))
//                .collect(Collectors.toList());
//
//        // Đếm theo level
//        Long internJobs = jobRepository.countByLevel("INTERN");
//        Long fresherJobs = jobRepository.countByLevel("FRESHER");
//        Long juniorJobs = jobRepository.countByLevel("JUNIOR");
//        Long middleJobs = jobRepository.countByLevel("MIDDLE");
//        Long seniorJobs = jobRepository.countByLevel("SENIOR");
//        Long leaderJobs = jobRepository.countByLevel("SENIOR");
//
//        return new DashboardStatsResponseDto.JobStats(
//                totalJobs,
//                activeJobs,
//                expiredJobs,
//                newJobsThisMonth,
//                topSkills,
//                internJobs,
//                fresherJobs,
//                juniorJobs,
//                middleJobs,
//                seniorJobs,
//                leaderJobs
//        );
//    }
//
//    private DashboardStatsResponseDto.ResumeStats getResumeStats() {
//        Long totalResumes = resumeRepository.count();
//        Long pendingResumes = resumeRepository.countByStatus(ResumeStatus.PENDING);
//        Long reviewingResumes = resumeRepository.countByStatus(ResumeStatus.REVIEWING);
//        Long approvedResumes = resumeRepository.countByStatus(ResumeStatus.APPROVED);
//        Long rejectedResumes = resumeRepository.countByStatus(ResumeStatus.REJECTED);
//
//        Double approvalRate = totalResumes > 0
//                ? (approvedResumes.doubleValue() / totalResumes.doubleValue()) * 100
//                : 0.0;
//
//        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
//        Long newResumesThisMonth = resumeRepository.countByCreatedAtAfter(startOfMonth);
//
//        return new DashboardStatsResponseDto.ResumeStats(
//                totalResumes,
//                pendingResumes,
//                reviewingResumes,
//                approvedResumes,
//                rejectedResumes,
//                approvalRate,
//                newResumesThisMonth
//        );
//    }
//
//    private DashboardStatsResponseDto.CompanyStats getCompanyStats() {
//        Long totalCompanies = companyRepository.count();
//        Long activeCompanies = companyRepository.countCompaniesWithActiveJobs(LocalDateTime.now());
//
//        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
//        Long newCompaniesThisMonth = companyRepository.countByCreatedAtAfter(startOfMonth);
//
//        List<DashboardStatsResponseDto.CompanyJobCount> topCompanies = companyRepository.findTopCompaniesByJobCount(10)
//                .stream()
//                .map(obj -> new DashboardStatsResponseDto.CompanyJobCount((Long) obj[0], (String) obj[1], (Long) obj[2]))
//                .collect(Collectors.toList());
//
//        return new DashboardStatsResponseDto.CompanyStats(
//                totalCompanies,
//                activeCompanies,
//                newCompaniesThisMonth,
//                topCompanies
//        );
//    }
//
//    private DashboardStatsResponseDto.ChartData getChartData() {
//        List<DashboardStatsResponseDto.MonthlyData> usersByMonth = getLast6MonthsData("users");
//        List<DashboardStatsResponseDto.MonthlyData> jobsByMonth = getLast6MonthsData("jobs");
//        List<DashboardStatsResponseDto.MonthlyData> resumesByMonth = getLast6MonthsData("resumes");
//
//        return new DashboardStatsResponseDto.ChartData(usersByMonth, jobsByMonth, resumesByMonth);
//    }
//
//    private DashboardStatsResponseDto.TopPerformers getTopPerformers() {
//        List<DashboardStatsResponseDto.CompanyResumeCount> topCompaniesByResumes = companyRepository.findTopCompaniesByResumeCount(10)
//                .stream()
//                .map(obj -> new DashboardStatsResponseDto.CompanyResumeCount((Long) obj[0], (String) obj[1], (Long) obj[2]))
//                .collect(Collectors.toList());
//
//        List<DashboardStatsResponseDto.JobResumeCount> topJobsByResumes = jobRepository.findTopJobsByResumeCount(10)
//                .stream()
//                .map(obj -> new DashboardStatsResponseDto.JobResumeCount((Long) obj[0], (String) obj[1], (String) obj[2], (Long) obj[3]))
//                .collect(Collectors.toList());
//
//        List<DashboardStatsResponseDto.SkillCount> topSkills = skillRepository.findTopSkillsByJobCount(10)
//                .stream()
//                .map(obj -> new DashboardStatsResponseDto.SkillCount((String) obj[0], (Long) obj[1]))
//                .collect(Collectors.toList());
//
//        return new DashboardStatsResponseDto.TopPerformers(topCompaniesByResumes, topJobsByResumes, topSkills);
//    }
//
//    private List<DashboardStatsResponseDto.MonthlyData> getLast6MonthsData(String type) {
//        List<DashboardStatsResponseDto.MonthlyData> result = new ArrayList<>();
//        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
//
//        for (int i = 5; i >= 0; i--) {
//            YearMonth yearMonth = YearMonth.now().minusMonths(i);
//            String monthStr = yearMonth.format(formatter);
//
//            LocalDateTime startOfMonth = yearMonth.atDay(1).atStartOfDay();
//            LocalDateTime endOfMonth = yearMonth.atEndOfMonth().atTime(23, 59, 59);
//
//            Long count = switch (type) {
//                case "users" -> userRepository.countByCreatedAtBetween(startOfMonth, endOfMonth);
//                case "jobs" -> jobRepository.countByCreatedAtBetween(startOfMonth, endOfMonth);
//                case "resumes" -> resumeRepository.countByCreatedAtBetween(startOfMonth, endOfMonth);
//                default -> 0L;
//            };
//
//            result.add(new DashboardStatsResponseDto.MonthlyData(monthStr, count));
//        }
//
//        return result;
//    }
//
//    private Double calculateGrowthRate(Long current, Long previous) {
//        if (previous == 0) return current > 0 ? 100.0 : 0.0;
//        return ((current - previous) / previous.doubleValue()) * 100;
//    }
//}
