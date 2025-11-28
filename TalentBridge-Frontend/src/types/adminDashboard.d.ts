export interface DashboardStatsResponseDto {
  overviewStats: OverviewStats;
  userStats: UserStats;
  jobStats: JobStats;
  resumeStats: ResumeStats;
  companyStats: CompanyStats;
  chartData: ChartData;
  topPerformers: TopPerformers;
}

export interface OverviewStats {
  totalUsers: number;
  totalJobs: number;
  totalResumes: number;
  totalCompanies: number;
  totalSubscribers: number;
  userGrowthRate: number | null;
  jobGrowthRate: number | null;
  resumeGrowthRate: number | null;
  companyGrowthRate: number | null;
  subscriberGrowthRate: number | null;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  newUsersGrowthRate: number | null;
  adminCount: number;
  recruiterCount: number;
  userCount: number;
}

export interface JobStats {
  totalJobs: number;
  activeJobs: number;
  expiredJobs: number;
  newJobsThisMonth: number;
  newJobsGrowthRate: number | null;
  topSkills: SkillCount[];
  internJobs: number;
  fresherJobs: number;
  middleJobs: number;
  seniorJobs: number;
  leaderJobs: number;
}

export interface ResumeStats {
  totalResumes: number;
  pendingResumes: number;
  reviewingResumes: number;
  approvedResumes: number;
  rejectedResumes: number;
  approvalRate: number | null;
  newResumesThisMonth: number;
  newResumesGrowthRate: number | null;
}

export interface CompanyStats {
  totalCompanies: number;
  activeCompanies: number;
  newCompaniesThisMonth: number;
  topCompanies: CompanyJobCount[];
}

export interface ChartData {
  usersByMonth: MonthlyData[];
  jobsByMonth: MonthlyData[];
  resumesByMonth: MonthlyData[];
}

export interface TopPerformers {
  topCompaniesByResumes: CompanyResumeCount[];
  topJobsByResumes: JobResumeCount[];
  topSkills: SkillCount[];
}

// Helper interfaces
export interface SkillCount {
  skillName: string;
  count: number;
}

export interface CompanyJobCount {
  companyId: number;
  companyName: string;
  jobCount: number;
}

export interface CompanyResumeCount {
  companyId: number;
  companyName: string;
  resumeCount: number;
}

export interface JobResumeCount {
  jobId: number;
  jobName: string;
  companyName: string;
  resumeCount: number;
}

export interface MonthlyData {
  month: string; // "2024-01", "2024-02", ...
  count: number;
}

