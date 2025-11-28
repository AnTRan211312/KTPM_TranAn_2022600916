import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/services/passwordResetApi";
import type { ResetPasswordRequestDto } from "@/types/user.d.ts";
import { ArrowLeft, Loader2, Lock, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

export default function ResetPasswordPage() {
    const location = useLocation();
    const navigate = useNavigate();

    // Get email and OTP from location state
    const email = location.state?.email;
    const otp = location.state?.otp;

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Redirect if email or OTP is missing
    if (!email || !otp) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 py-12 px-4">
                <div className="w-full max-w-md">
                    <Card className="shadow-2xl border-0 overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-yellow-500 p-6">
                            <CardTitle className="text-2xl font-bold text-white">
                                Lỗi
                            </CardTitle>
                        </div>
                        <CardContent className="p-6 bg-white">
                            <div className="text-center">
                                <p className="text-gray-600 mb-6">
                                    Phiên làm việc của bạn đã hết hạn. Vui lòng bắt đầu lại từ đầu.
                                </p>
                                <Link to="/auth?mode=forgot">
                                    <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold">
                                        Quay lại quên mật khẩu
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) {
            toast.error("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp");
            return;
        }

        try {
            setIsLoading(true);
            const request: ResetPasswordRequestDto = {
                email,
                otp,
                newPassword,
            };
            await resetPassword(request);
            toast.success("Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.");
            setTimeout(() => {
                navigate("/auth?mode=login");
            }, 2000);
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Không thể đặt lại mật khẩu. Vui lòng thử lại",
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 py-12 px-4">
            <div className="w-full max-w-md">
                <Card className="shadow-2xl border-0 overflow-hidden">
                    {/* Header với gradient */}
                    <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-yellow-500 p-6">
                        <div className="flex items-center gap-3">
                            <Link
                                to="/auth?mode=forgot"
                                className="text-white hover:text-orange-100 transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div className="flex items-center gap-3 flex-1">
                                <Lock className="h-6 w-6 text-white" />
                                <CardTitle className="text-2xl font-bold text-white">
                                    Đặt lại mật khẩu
                                </CardTitle>
                            </div>
                        </div>
                    </div>
                    <CardContent className="p-6 bg-white">
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 mb-4">
                                    <Lock className="h-8 w-8 text-green-600" />
                                </div>
                                <p className="text-gray-600">
                                    Tạo mật khẩu mới cho tài khoản của bạn
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700">
                                    Mật khẩu mới
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        placeholder="Tối thiểu 6 ký tự"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        disabled={isLoading}
                                        minLength={6}
                                        required
                                        className="pl-10 h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                                    />
                                </div>
                                {newPassword.length > 0 && newPassword.length < 6 && (
                                    <p className="text-xs text-red-500">Mật khẩu phải có ít nhất 6 ký tự</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                                    Xác nhận mật khẩu
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Nhập lại mật khẩu"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        disabled={isLoading}
                                        minLength={6}
                                        required
                                        className="pl-10 h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                                    />
                                </div>
                                {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                                    <p className="text-xs text-red-500">Mật khẩu xác nhận không khớp</p>
                                )}
                                {confirmPassword.length > 0 && newPassword === confirmPassword && newPassword.length >= 6 && (
                                    <p className="text-xs text-green-600 flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Mật khẩu khớp
                                    </p>
                                )}
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                                disabled={isLoading || newPassword !== confirmPassword || newPassword.length < 6}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="mr-2 h-5 w-5" />
                                        Đặt lại mật khẩu
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full text-gray-600 hover:text-gray-900"
                                onClick={() => navigate("/auth?mode=forgot")}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Quay lại
                            </Button>
                        </form>

                        <div className="mt-6 text-center border-t pt-4">
                            <Link
                                to="/auth?mode=login"
                                className="text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline transition-colors"
                            >
                                ← Quay lại đăng nhập
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
