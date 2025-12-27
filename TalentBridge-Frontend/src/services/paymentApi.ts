import axiosClient from "@/lib/axiosClient";
import type { ApiResponse } from "@/types/apiResponse";

export interface PaymentUrlResponse {
    paymentUrl: string;
    orderId: string;
}

export interface PaymentStatusResponse {
    paid: boolean;
    applicantCount: number | null;
    jobName: string;
}

/**
 * Create VNPay payment for viewing job applicants
 */
export const createPayment = (jobId: number) => {
    return axiosClient.post<ApiResponse<PaymentUrlResponse>>("/payments/create", {
        jobId,
    });
};

/**
 * Check if user has paid to view job applicants
 */
export const checkPaymentStatus = (jobId: number) => {
    return axiosClient.get<ApiResponse<PaymentStatusResponse>>(
        `/payments/check/${jobId}`
    );
};
