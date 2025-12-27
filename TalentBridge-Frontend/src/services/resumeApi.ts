import axiosClient from "@/lib/axiosClient";
import type {
  ApiResponse,
  PageResponseDto,
  PaginationParams,
} from "@/types/apiResponse.d.ts";
import type {
  ResumeForDisplayResponseDto,
  UpdateResumeStatusRequestDto,
} from "@/types/resume";

// Types cho stats
export interface ResumeStatusStats {
  PENDING: number;
  REVIEWING: number;
  APPROVED: number;
  REJECTED: number;
}

// API lấy thống kê status của resume
export const getResumeStatsByStatus = () => {
  return axiosClient.get<ApiResponse<ResumeStatusStats>>("/resumes/stats/status");
};

// API lấy thống kê status của resume cho công ty của Recruiter
export const getResumeStatsByStatusForRecruiterCompany = () => {
  return axiosClient.get<ApiResponse<ResumeStatusStats>>("/resumes/company/stats/status");
};

// API kiểm tra user đã nộp CV cho job này chưa
export const checkApplied = (jobId: number) => {
  return axiosClient.get<ApiResponse<boolean>>(`/resumes/check-applied/${jobId}`);
};

export const saveResume = (formData: FormData) => {
  return axiosClient.post("/resumes", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const findAllResumes = ({
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

  return axiosClient.get<
    ApiResponse<PageResponseDto<ResumeForDisplayResponseDto>>
  >(`/resumes?${params.toString()}`);
};

export const findAllResumesForRecruiterCompany = ({
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

  return axiosClient.get<
    ApiResponse<PageResponseDto<ResumeForDisplayResponseDto>>
  >(`/resumes/company?${params.toString()}`);
};

export const findSelfResumes = ({ page = 0, size = 3 }: PaginationParams) => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  return axiosClient.get<
    ApiResponse<PageResponseDto<ResumeForDisplayResponseDto>>
  >(`/resumes/me?${params.toString()}`);
};

export const removeSelfResumeByJobId = (jobId: number) => {
  return axiosClient.delete(`/resumes/me/jobs/${jobId}`);
};

export const updateSelfResumeFile = (resumeId: number, formData: FormData) => {
  return axiosClient.put<ApiResponse<ResumeForDisplayResponseDto>>(
    `/resumes/me/file/${resumeId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
};

export const updateResumeStatus = (resume: UpdateResumeStatusRequestDto) => {
  return axiosClient.put<ApiResponse<ResumeForDisplayResponseDto>>(
    `/resumes/status`,
    resume,
  );
};

export const updateResumeStatusForRecruiterCompany = (
  resume: UpdateResumeStatusRequestDto,
) => {
  return axiosClient.put<ApiResponse<ResumeForDisplayResponseDto>>(
    `/resumes/company/status`,
    resume,
  );
};

// Types for CV Analysis
export interface CVAnalysisResponse {
  matchScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  summary: string;
  jobName: string;
  resumeId?: number;
}

// API phân tích CV đã nộp (dành cho Recruiter)
export const analyzeResume = (resumeId: number) => {
  return axiosClient.post<ApiResponse<CVAnalysisResponse>>(
    `/resumes/${resumeId}/analyze`,
  );
};

// API phân tích CV preview trước khi nộp (dành cho User)
export const analyzeResumePreview = (formData: FormData, jobId: number) => {
  return axiosClient.post<ApiResponse<CVAnalysisResponse>>(
    `/resumes/analyze-preview?jobId=${jobId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
};
