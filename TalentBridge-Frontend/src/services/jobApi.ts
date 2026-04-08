import axiosClient from "@/lib/axiosClient";
import { consumeSSE } from "@/utils/sseUtils";
import type {
  ApiResponse,
  PageResponseDto,
  PaginationParams,
} from "@/types/apiResponse.d.ts";
import type { Job, JobUpsertDto } from "@/types/job";

export const saveJob = (data: JobUpsertDto) => {
  return axiosClient.post("/jobs", data);
};

export const saveJobForRecruiterPage = (data: JobUpsertDto) => {
  return axiosClient.post("/jobs/company", data);
};

export const findAllJobs = ({
  page = 0,
  size = 5,
  filter,
  sort,
}: PaginationParams) => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (filter) params.append("filter", filter);
  if (sort) params.append("sort", sort);

  return axiosClient.get<ApiResponse<PageResponseDto<Job>>>(
    `/jobs?${params.toString()}`,
  );
};

export const findJobById = (id: number) => {
  return axiosClient.get<ApiResponse<Job>>(`/jobs/${id}`);
};

export const findJobByCompanyId = (id: number) => {
  return axiosClient.get<ApiResponse<Job[]>>(`/jobs/companies/${id}`);
};

export const findAllJobsForRecruiterCompany = ({
  page = 0,
  size = 5,
  filter,
  sort,
}: PaginationParams) => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (filter) params.append("filter", filter);
  if (sort) params.append("sort", sort);

  return axiosClient.get<ApiResponse<PageResponseDto<Job>>>(
    `/jobs/company?${params.toString()}`,
  );
};

export const updateJobById = (id: number, data: JobUpsertDto) => {
  return axiosClient.put(`/jobs/${id}`, data);
};

export const updateJobByIdForRecruiterCompany = (
  id: number,
  data: JobUpsertDto,
) => {
  return axiosClient.put(`/jobs/company/${id}`, data);
};

export const deleteJobById = (id: number) => {
  return axiosClient.delete(`/jobs/${id}`);
};

export const deleteJobByIdForRecruiterCompany = (id: number) => {
  return axiosClient.delete(`/jobs/company/${id}`);
};

// Types cho stats
export interface JobLevelStats {
  INTERN: number;
  FRESHER: number;
  MIDDLE: number;
  SENIOR: number;
  LEADER: number;
}

// API lấy thống kê level của job
export const getJobStatsByLevel = () => {
  return axiosClient.get<ApiResponse<JobLevelStats>>("/jobs/stats/level");
};

// API lấy thống kê level của job cho công ty của Recruiter
export const getJobStatsByLevelForRecruiterCompany = () => {
  return axiosClient.get<ApiResponse<JobLevelStats>>("/jobs/company/stats/level");
};

// API tạo câu hỏi phỏng vấn bằng AI - Streaming version
export const generateInterviewQuestionsStream = (
  jobId: number,
  onChunk: (text: string) => void,
  onComplete?: () => void,
  onError?: (error: Error) => void
) => {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
  const url = `${baseUrl}/jobs/${jobId}/interview-questions`;

  return consumeSSE(url, { onChunk, onComplete, onError });
};
