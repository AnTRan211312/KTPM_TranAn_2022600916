import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaymentResultPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    const success = searchParams.get("success") === "true";
    const orderId = searchParams.get("orderId");

    useEffect(() => {
        // Short delay to show loading state
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
                    <p className="mt-4 text-gray-600">Đang xử lý kết quả thanh toán...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    {success ? (
                        <>
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                            <CardTitle className="text-2xl text-green-800">
                                Thanh toán thành công!
                            </CardTitle>
                        </>
                    ) : (
                        <>
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                                <XCircle className="h-10 w-10 text-red-600" />
                            </div>
                            <CardTitle className="text-2xl text-red-800">
                                Thanh toán thất bại
                            </CardTitle>
                        </>
                    )}
                </CardHeader>

                <CardContent className="space-y-4">
                    {success ? (
                        <>
                            <p className="text-center text-gray-600">
                                Cảm ơn bạn đã thanh toán. Bạn có thể xem số lượng người ứng
                                tuyển ngay bây giờ.
                            </p>
                            {orderId && (
                                <div className="rounded-lg bg-gray-50 p-3 text-center">
                                    <p className="text-sm text-gray-500">Mã đơn hàng</p>
                                    <p className="font-mono text-sm font-medium">{orderId}</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-center text-gray-600">
                            Thanh toán không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ
                            nếu bạn gặp vấn đề.
                        </p>
                    )}

                    <div className="flex flex-col gap-2 pt-4">
                        <Button
                            onClick={() => navigate("/jobs")}
                            className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Quay lại danh sách việc làm
                        </Button>

                        {!success && (
                            <Button
                                variant="outline"
                                onClick={() => window.history.back()}
                                className="w-full"
                            >
                                Thử lại
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
