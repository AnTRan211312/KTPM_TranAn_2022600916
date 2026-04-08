import axiosClient from "@/lib/axiosClient";
import { consumeSSEWithBody } from "@/utils/sseUtils";

import type {
    ApiResponse,
} from "@/types/apiResponse.d.ts";
import type {
    CreateUserCVRequestDto,
    UpdateUserCVRequestDto,
    UserCVResponseDto,
    UserCVSummaryDto,
} from "@/types/cv";

/**
 * Tạo CV mới
 */
export const createUserCV = (data: CreateUserCVRequestDto) => {
    return axiosClient.post<ApiResponse<UserCVResponseDto>>("/user-cvs", data);
};

/**
 * Cập nhật CV
 */
export const updateUserCV = (data: UpdateUserCVRequestDto) => {
    return axiosClient.put<ApiResponse<UserCVResponseDto>>("/user-cvs", data);
};

/**
 * Lấy danh sách CV của user (summary, không có cvData)
 */
export const getMyCVs = () => {
    return axiosClient.get<ApiResponse<UserCVSummaryDto[]>>("/user-cvs");
};

/**
 * Lấy chi tiết CV theo ID (có cvData)
 */
export const getCVById = (id: number) => {
    return axiosClient.get<ApiResponse<UserCVResponseDto>>(`/user-cvs/${id}`);
};

/**
 * Xóa CV
 */
export const deleteUserCV = (id: number) => {
    return axiosClient.delete<ApiResponse<void>>(`/user-cvs/${id}`);
};

/**
 * Đặt CV làm mặc định
 */
export const setDefaultCV = (id: number) => {
    return axiosClient.patch<ApiResponse<UserCVResponseDto>>(`/user-cvs/${id}/set-default`);
};

/**
 * Đếm số CV
 */
export const countMyCVs = () => {
    return axiosClient.get<ApiResponse<number>>("/user-cvs/count");
};

/**
 * Gợi ý CV bằng AI - Streaming version
 */
export const generateCVAiSuggestionStream = (
    cvData: string,
    onChunk: (text: string) => void,
    onComplete?: () => void,
    onError?: (error: Error) => void
) => {
    const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
    const url = `${baseUrl}/user-cvs/ai-suggest`;

    return consumeSSEWithBody(url, cvData, {
        onChunk,
        onComplete,
        onError,
    });
};


