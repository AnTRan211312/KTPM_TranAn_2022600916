import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  forgotPassword,
  resendOtp,
  verifyOtp,
} from "@/services/passwordResetApi";
import { ArrowLeft, Loader2, Mail, Shield, CheckCircle2, Clock, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Step = "forgot" | "verify";

export default function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("forgot");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpExpiresIn, setOtpExpiresIn] = useState<number | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(
    null,
  );

  // Bước 1: Gửi OTP
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Vui lòng nhập email");
      return;
    }

    try {
      setIsLoading(true);
      const response = await forgotPassword({ email });
      const data = response.data.data;
      setOtpExpiresIn(data.expiresIn);
      setRemainingAttempts(data.remainingAttempts);
      toast.success(data.message || "Mã OTP đã được gửi đến email của bạn");
      setStep("verify");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể gửi mã OTP. Vui lòng thử lại",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Gửi lại OTP
  const handleResendOtp = async () => {
    try {
      setIsLoading(true);
      const response = await resendOtp({ email });
      const data = response.data.data;
      setOtpExpiresIn(data.expiresIn);
      setRemainingAttempts(data.remainingAttempts);
      toast.success(data.message || "Đã gửi lại mã OTP");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể gửi lại mã OTP. Vui lòng thử lại",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Bước 2: Xác thực OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("=== START VERIFY OTP ===");
    console.log("Email:", email);
    console.log("OTP:", otp);

    if (!otp || otp.length !== 6) {
      toast.error("Mã OTP phải có 6 ký tự");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Calling verifyOtp API...");
      const response = await verifyOtp({ email, otp });
      console.log("=== FULL RESPONSE ===");
      console.log("Response:", response);
      console.log("Response.data:", response.data);
      console.log("Response.data.data:", response.data?.data);

      // Extract data from response - handle both nested and flat structures
      const verifyData = response.data?.data || response.data;
      console.log("=== EXTRACTED DATA ===");
      console.log("verifyData:", verifyData);
      console.log("verifyData.success:", verifyData?.success);
      console.log("verifyData.message:", verifyData?.message);
      console.log("verifyData.valid:", verifyData?.valid);
      console.log("verifyData.isValid:", verifyData?.isValid);
      console.log("typeof verifyData.valid:", typeof verifyData?.valid);

      // Check if OTP is valid - backend returns 'valid' not 'isValid'
      const isValid = verifyData?.valid === true || verifyData?.isValid === true;
      console.log("=== VALIDATION CHECK ===");
      console.log("isValid result:", isValid);

      if (isValid) {
        console.log("✅ OTP verification successful!");
        console.log("Navigating to /reset-password with state:", { email, otp });
        toast.success("Xác thực OTP thành công");

        // Navigate to reset password page with email and OTP in state
        navigate("/reset-password", {
          state: {
            email,
            otp,
          },
        });
        console.log("Navigation called!");
      } else {
        console.log("❌ OTP verification failed!");
        console.log("Reason: isValid is", verifyData?.isValid);
        toast.error(verifyData?.message || "Mã OTP không hợp lệ");
      }
    } catch (error: any) {
      console.error("=== ERROR OCCURRED ===");
      console.error("Error:", error);
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);
      toast.error(
        error.response?.data?.message || "Mã OTP không hợp lệ. Vui lòng thử lại",
      );
    } finally {
      setIsLoading(false);
      console.log("=== END VERIFY OTP ===");
    }
  };

  const formatTime = (seconds: number | null) => {
    if (!seconds) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Countdown timer
  useEffect(() => {
    if (otpExpiresIn !== null && otpExpiresIn > 0 && step === "verify") {
      const timer = setInterval(() => {
        setOtpExpiresIn((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [otpExpiresIn, step]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 py-12 px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 overflow-hidden">
          {/* Header với gradient */}
          <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-yellow-500 p-6">
            <div className="flex items-center gap-3">
              <Link
                to="/auth?mode=login"
                className="text-white hover:text-orange-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-3 flex-1">
                {step === "forgot" && <Mail className="h-6 w-6 text-white" />}
                {step === "verify" && <Shield className="h-6 w-6 text-white" />}
                <CardTitle className="text-2xl font-bold text-white">
                  {step === "forgot" && "Quên mật khẩu"}
                  {step === "verify" && "Xác thực OTP"}
                </CardTitle>
              </div>
            </div>
          </div>
          <CardContent className="p-6 bg-white">
            {/* Bước 1: Quên mật khẩu */}
            {step === "forgot" && (
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-yellow-100 mb-4">
                    <Mail className="h-8 w-8 text-orange-600" />
                  </div>
                  <p className="text-gray-600">
                    Nhập email của bạn để nhận mã OTP khôi phục mật khẩu
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Địa chỉ email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      required
                      className="pl-10 h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-5 w-5" />
                      Gửi mã OTP
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Bước 2: Xác thực OTP */}
            {step === "verify" && (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 mb-4">
                    <Shield className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-gray-600">
                    Chúng tôi đã gửi mã OTP đến <strong className="text-orange-600">{email}</strong>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-sm font-semibold text-gray-700">
                    Mã OTP (6 ký tự)
                  </Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      disabled={isLoading}
                      maxLength={6}
                      required
                      className="pl-10 h-14 text-center text-2xl font-bold tracking-widest border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    {otpExpiresIn !== null && otpExpiresIn > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="text-gray-600">
                          Hết hạn sau: <strong className="text-orange-600">{formatTime(otpExpiresIn)}</strong>
                        </span>
                      </div>
                    )}
                    {remainingAttempts !== null && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">
                          Còn lại: <strong className="text-blue-600">{remainingAttempts} lần</strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-12 border-gray-300 hover:bg-gray-50"
                    onClick={handleResendOtp}
                    disabled={isLoading || (otpExpiresIn !== null && otpExpiresIn > 0)}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Gửi lại
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Đang xác thực...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Xác thực
                      </>
                    )}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-gray-600 hover:text-gray-900"
                  onClick={() => {
                    setStep("forgot");
                    setOtp("");
                  }}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại
                </Button>
              </form>
            )}

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

