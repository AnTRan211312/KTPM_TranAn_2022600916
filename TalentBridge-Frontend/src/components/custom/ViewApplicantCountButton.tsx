import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Users, Loader2, CreditCard, Check } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { createPayment, checkPaymentStatus } from "@/services/paymentApi";
import { toast } from "sonner";

interface ViewApplicantCountButtonProps {
    jobId: number;
    jobName: string;
}

export function ViewApplicantCountButton({
    jobId,
    jobName,
}: ViewApplicantCountButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<{
        paid: boolean;
        applicantCount: number | null;
    } | null>(null);

    // Auto-check payment status on mount
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const response = await checkPaymentStatus(jobId);
                setPaymentStatus(response.data.data);
            } catch (error) {
                console.error("Error checking payment status:", error);
            } finally {
                setIsInitialLoading(false);
            }
        };
        checkStatus();
    }, [jobId]);

    const handleCheckStatus = async () => {
        setIsLoading(true);
        try {
            const response = await checkPaymentStatus(jobId);
            setPaymentStatus(response.data.data);

            if (response.data.data.paid) {
                // Already paid, show the count directly
                toast.success(
                    `Số người ứng tuyển: ${response.data.data.applicantCount}`
                );
            } else {
                // Not paid, show payment dialog
                setShowDialog(true);
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra khi kiểm tra trạng thái thanh toán");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePayment = async () => {
        setIsLoading(true);
        try {
            const response = await createPayment(jobId);
            const paymentUrl = response.data.data.paymentUrl;

            // Redirect to VNPay
            window.location.href = paymentUrl;
        } catch (error: any) {
            const message =
                error?.response?.data?.message || "Có lỗi xảy ra khi tạo thanh toán";
            toast.error(message);
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    if (paymentStatus?.paid) {
        return (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                <Check className="h-5 w-5 text-green-600" />
                <div>
                    <p className="text-sm font-medium text-green-800">
                        Số người ứng tuyển
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                        {paymentStatus.applicantCount}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Button
                variant="outline"
                onClick={handleCheckStatus}
                disabled={isLoading}
                className="gap-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Users className="h-4 w-4" />
                )}
                Xem số người ứng tuyển
            </Button>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                            Thanh toán để xem số ứng viên
                        </DialogTitle>
                        <DialogDescription>
                            Thanh toán {formatCurrency(10000)} để xem số lượng người ứng tuyển
                            cho công việc "<span className="font-medium">{jobName}</span>"
                        </DialogDescription>
                    </DialogHeader>

                    <div className="my-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Phí xem thông tin:</span>
                            <span className="text-xl font-bold text-blue-600">
                                {formatCurrency(10000)}
                            </span>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            * Thanh toán qua VNPay (Thẻ ATM/Visa/MasterCard/QR Code)
                        </p>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setShowDialog(false)}>
                            Hủy
                        </Button>
                        <Button
                            onClick={handlePayment}
                            disabled={isLoading}
                            className="gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <CreditCard className="h-4 w-4" />
                            )}
                            Thanh toán ngay
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
