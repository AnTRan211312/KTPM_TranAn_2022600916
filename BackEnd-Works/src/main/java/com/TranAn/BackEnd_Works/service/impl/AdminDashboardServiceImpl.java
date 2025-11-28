package com.TranAn.BackEnd_Works.service.impl;


import com.TranAn.BackEnd_Works.dto.admin.DashboardStatsResponseDto;
import com.TranAn.BackEnd_Works.model.constant.Level;
import com.TranAn.BackEnd_Works.model.constant.ResumeStatus;
import com.TranAn.BackEnd_Works.repository.*;
import com.TranAn.BackEnd_Works.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ResumeRepository resumeRepository;
    private final CompanyRepository companyRepository;
    private final SubscriberRepository subscriberRepository;
    private final SkillRepository skillRepository;

    @Override
    public DashboardStatsResponseDto getDashboardStats() {
        DashboardStatsResponseDto response = new DashboardStatsResponseDto();

        response.setOverviewStats(getOverviewStats());
        response.setUserStats(getUserStats());
        response.setJobStats(getJobStats());
        response.setResumeStats(getResumeStats());
        response.setCompanyStats(getCompanyStats());
        response.setChartData(getChartData());
        response.setTopPerformers(getTopPerformers());

        return response;
    }

    private DashboardStatsResponseDto.OverviewStats getOverviewStats() {
        Instant now = Instant.now();
        Instant startOfThisMonth = now.atZone(ZoneId.systemDefault())
                .withDayOfMonth(1)
                .withHour(0)
                .withMinute(0)
                .withSecond(0)
                .withNano(0)
                .toInstant();
        Instant startOfLastMonth = startOfThisMonth.atZone(ZoneId.systemDefault())
                .minusMonths(1)
                .toInstant();

        Long totalUsers = userRepository.count();
        Long totalJobs = jobRepository.count();
        Long totalResumes = resumeRepository.count();
        Long totalCompanies = companyRepository.count();
        Long totalSubscribers = subscriberRepository.count();

        // Tính growth rate
        Long usersThisMonth = userRepository.countByCreatedAtAfter(startOfThisMonth);
        Long usersLastMonth = userRepository.countByCreatedAtBetween(startOfLastMonth, startOfThisMonth);
        Double userGrowthRate = calculateGrowthRate(usersThisMonth, usersLastMonth);

        Long jobsThisMonth = jobRepository.countByCreatedAtAfter(startOfThisMonth);
        Long jobsLastMonth = jobRepository.countByCreatedAtBetween(startOfLastMonth, startOfThisMonth);
        Double jobGrowthRate = calculateGrowthRate(jobsThisMonth, jobsLastMonth);

        Long resumesThisMonth = resumeRepository.countByCreatedAtAfter(startOfThisMonth);
        Long resumesLastMonth = resumeRepository.countByCreatedAtBetween(startOfLastMonth, startOfThisMonth);
        Double resumeGrowthRate = calculateGrowthRate(resumesThisMonth, resumesLastMonth);

        return new DashboardStatsResponseDto.OverviewStats(
                totalUsers,
                totalJobs,
                totalResumes,
                totalCompanies,
                totalSubscribers,
                userGrowthRate,
                jobGrowthRate,
                resumeGrowthRate
        );
    }

    private DashboardStatsResponseDto.UserStats getUserStats() {
        Long totalUsers = userRepository.count();

        Instant now = Instant.now();
        Instant thirtyDaysAgo = now.minusSeconds(30L * 24 * 60 * 60);
        // Tạm thời dùng createdAt thay cho lastLogin (vì chưa có field lastLogin)
        Long activeUsers = userRepository.countByCreatedAtAfter(thirtyDaysAgo);

        Instant startOfMonth = now.atZone(ZoneId.systemDefault())
                .withDayOfMonth(1)
                .withHour(0)
                .withMinute(0)
                .withSecond(0)
                .withNano(0)
                .toInstant();
        Long newUsersThisMonth = userRepository.countByCreatedAtAfter(startOfMonth);

        // Đếm theo role
        Long adminCount = userRepository.countByRole_Name("ADMIN");
        Long recruiterCount = userRepository.countByRole_Name("RECRUITER");
        Long userCount = userRepository.countByRole_Name("USER");

        return new DashboardStatsResponseDto.UserStats(
                totalUsers,
                activeUsers,
                newUsersThisMonth,
                adminCount,
                recruiterCount,
                userCount
        );
    }

    private DashboardStatsResponseDto.JobStats getJobStats() {
        Long totalJobs = jobRepository.count();

        Instant now = Instant.now();
        Long activeJobs = jobRepository.countByEndDateAfter(now);
        Long expiredJobs = jobRepository.countByEndDateBefore(now);

        Instant startOfMonth = now.atZone(ZoneId.systemDefault())
                .withDayOfMonth(1)
                .withHour(0)
                .withMinute(0)
                .withSecond(0)
                .withNano(0)
                .toInstant();
        Long newJobsThisMonth = jobRepository.countByCreatedAtAfter(startOfMonth);

        // Top skills - limit 10
        List<DashboardStatsResponseDto.SkillCount> topSkills = skillRepository.findTopSkillsByJobCount()
                .stream()
                .limit(10)
                .map(obj -> new DashboardStatsResponseDto.SkillCount(
                        (String) obj[0],
                        (Long) obj[1]
                ))
                .collect(Collectors.toList());

        // Đếm theo level
        Long internJobs = jobRepository.countByLevel(Level.INTERN);
        Long fresherJobs = jobRepository.countByLevel(Level.FRESHER);
        Long middleJobs = jobRepository.countByLevel(Level.MIDDLE);
        Long seniorJobs = jobRepository.countByLevel(Level.SENIOR);
        Long leaderJobs = jobRepository.countByLevel(Level.LEADER);

        return new DashboardStatsResponseDto.JobStats(
                totalJobs,
                activeJobs,
                expiredJobs,
                newJobsThisMonth,
                topSkills,
                internJobs,
                fresherJobs,
                middleJobs,
                seniorJobs,
                leaderJobs
        );
    }

    private DashboardStatsResponseDto.ResumeStats getResumeStats() {
        Long totalResumes = resumeRepository.count();
        Long pendingResumes = resumeRepository.countByStatus(ResumeStatus.PENDING);
        Long reviewingResumes = resumeRepository.countByStatus(ResumeStatus.REVIEWING);
        Long approvedResumes = resumeRepository.countByStatus(ResumeStatus.APPROVED);
        Long rejectedResumes = resumeRepository.countByStatus(ResumeStatus.REJECTED);

        Double approvalRate = totalResumes > 0
                ? (approvedResumes.doubleValue() / totalResumes.doubleValue()) * 100
                : 0.0;

        Instant startOfMonth = Instant.now().atZone(ZoneId.systemDefault())
                .withDayOfMonth(1)
                .withHour(0)
                .withMinute(0)
                .withSecond(0)
                .withNano(0)
                .toInstant();
        Long newResumesThisMonth = resumeRepository.countByCreatedAtAfter(startOfMonth);

        return new DashboardStatsResponseDto.ResumeStats(
                totalResumes,
                pendingResumes,
                reviewingResumes,
                approvedResumes,
                rejectedResumes,
                approvalRate,
                newResumesThisMonth
        );
    }

    private DashboardStatsResponseDto.CompanyStats getCompanyStats() {
        Long totalCompanies = companyRepository.count();
        Instant now = Instant.now();
        Long activeCompanies = companyRepository.countCompaniesWithActiveJobs(now);

        Instant startOfMonth = now.atZone(ZoneId.systemDefault())
                .withDayOfMonth(1)
                .withHour(0)
                .withMinute(0)
                .withSecond(0)
                .withNano(0)
                .toInstant();
        Long newCompaniesThisMonth = companyRepository.countByCreatedAtAfter(startOfMonth);

        // Top companies - limit 10
        List<DashboardStatsResponseDto.CompanyJobCount> topCompanies = companyRepository.findTopCompaniesByJobCount()
                .stream()
                .limit(10)
                .map(obj -> new DashboardStatsResponseDto.CompanyJobCount(
                        ((Number) obj[0]).longValue(),
                        (String) obj[1],
                        ((Number) obj[2]).longValue()
                ))
                .collect(Collectors.toList());

        return new DashboardStatsResponseDto.CompanyStats(
                totalCompanies,
                activeCompanies,
                newCompaniesThisMonth,
                topCompanies
        );
    }

    private DashboardStatsResponseDto.ChartData getChartData() {
        List<DashboardStatsResponseDto.MonthlyData> usersByMonth = getLast6MonthsData("users");
        List<DashboardStatsResponseDto.MonthlyData> jobsByMonth = getLast6MonthsData("jobs");
        List<DashboardStatsResponseDto.MonthlyData> resumesByMonth = getLast6MonthsData("resumes");

        return new DashboardStatsResponseDto.ChartData(usersByMonth, jobsByMonth, resumesByMonth);
    }

    private DashboardStatsResponseDto.TopPerformers getTopPerformers() {
        // Top companies by resumes - limit 10
        List<DashboardStatsResponseDto.CompanyResumeCount> topCompaniesByResumes = companyRepository.findTopCompaniesByResumeCount()
                .stream()
                .limit(10)
                .map(obj -> new DashboardStatsResponseDto.CompanyResumeCount(
                        ((Number) obj[0]).longValue(),
                        (String) obj[1],
                        ((Number) obj[2]).longValue()
                ))
                .collect(Collectors.toList());

        // Top jobs by resumes - limit 10
        List<DashboardStatsResponseDto.JobResumeCount> topJobsByResumes = jobRepository.findTopJobsByResumeCount()
                .stream()
                .limit(10)
                .map(obj -> new DashboardStatsResponseDto.JobResumeCount(
                        ((Number) obj[0]).longValue(),
                        (String) obj[1],
                        obj[2] != null ? (String) obj[2] : "N/A",
                        ((Number) obj[3]).longValue()
                ))
                .collect(Collectors.toList());

        // Top skills - limit 10
        List<DashboardStatsResponseDto.SkillCount> topSkills = skillRepository.findTopSkillsByJobCount()
                .stream()
                .limit(10)
                .map(obj -> new DashboardStatsResponseDto.SkillCount(
                        (String) obj[0],
                        (Long) obj[1]
                ))
                .collect(Collectors.toList());

        return new DashboardStatsResponseDto.TopPerformers(topCompaniesByResumes, topJobsByResumes, topSkills);
    }

    private List<DashboardStatsResponseDto.MonthlyData> getLast6MonthsData(String type) {
        List<DashboardStatsResponseDto.MonthlyData> result = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");

        for (int i = 5; i >= 0; i--) {
            YearMonth yearMonth = YearMonth.now().minusMonths(i);
            String monthStr = yearMonth.format(formatter);

            Instant startOfMonth = yearMonth.atDay(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
            Instant endOfMonth = yearMonth.atEndOfMonth().atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();

            Long count = switch (type) {
                case "users" -> userRepository.countByCreatedAtBetween(startOfMonth, endOfMonth);
                case "jobs" -> jobRepository.countByCreatedAtBetween(startOfMonth, endOfMonth);
                case "resumes" -> resumeRepository.countByCreatedAtBetween(startOfMonth, endOfMonth);
                default -> 0L;
            };

            result.add(new DashboardStatsResponseDto.MonthlyData(monthStr, count));
        }

        return result;
    }

    private Double calculateGrowthRate(Long current, Long previous) {
        if (previous == 0) return current > 0 ? 100.0 : 0.0;
        return ((current - previous) / previous.doubleValue()) * 100;
    }
}
