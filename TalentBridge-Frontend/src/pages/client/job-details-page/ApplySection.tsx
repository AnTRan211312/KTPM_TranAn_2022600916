import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button.tsx";
import { Send, Upload, X, FileText, CheckCircle2, Sparkles, AlertTriangle, ThumbsUp, Lightbulb, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { toast } from "sonner";
import { useAppSelector } from "@/features/hooks.ts";
import PDFViewer from "@/components/custom/PDFViewer.tsx";
import { getErrorMessage } from "@/features/slices/auth/authThunk.ts";
import type { CreateResumeRequestDto } from "@/types/resume";
import { saveResume, checkApplied, analyzeResumePreview, type CVAnalysisResponse } from "@/services/resumeApi.ts";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { checkFileSizeAndFileType } from "@/utils/fileMetadata.ts";
import { isJobExpired } from "@/utils/jobStatusHelper.ts";

interface ApplySectionProps {
  jobId: number;
  jobTitle: string;
  endDate: string;
  isActive: boolean;
}

export function ApplySection({ jobId, jobTitle, endDate, isActive }: ApplySectionProps) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CVAnalysisResponse | null>(null);

  const { isLogin, user } = useAppSelector((state) => state.auth);

  // Check if job is expired or inactive
  const jobExpired = isJobExpired(endDate);
  const canApply = isActive && !jobExpired && !hasApplied;

  // Kiểm tra đã nộp CV chưa
  useEffect(() => {
    if (isLogin && jobId) {
      const checkIfApplied = async () => {
        try {
          const res = await checkApplied(jobId);
          setHasApplied(res.data.data);
        } catch (err) {
          console.error("Failed to check applied status:", err);
        }
      };
      checkIfApplied();
    }
  }, [isLogin, jobId]);

  // =============================
  // INPUT REF
  // =============================
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const openInput = () => {
    if (pdfInputRef.current) pdfInputRef.current.click();
    else toast.error("Hệ thống đã gặp vấn đề");
  };

  // =============================
  // HANDLE PROCESS FILE
  // =============================

  const fileUrl = useMemo(() => {
    return selectedFile ? URL.createObjectURL(selectedFile) : "";
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  const handleApplyClick = () => {
    if (!isLogin) {
      toast.error("Bạn cần đăng nhập để ứng tuyển vị trí này", {
        action: {
          label: "Đăng nhập",
          onClick: () => navigate("/auth"),
        },
      });
      return;
    }

    if (jobExpired) {
      toast.error("Công việc này đã hết hạn nộp CV");
      return;
    }

    if (!isActive) {
      toast.error("Công việc này đã đóng");
      return;
    }

    setIsModalOpen(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!checkFileSizeAndFileType(file, 5 * 1024 * 1024, "application/pdf")) {
        toast.error("File không hợp lệ");
        return;
      }

      setSelectedFile(file);
    }
  };

  // =============================
  // HANDLE ACTION
  // =============================

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("Vui lòng chọn file CV");
      return;
    }

    setIsLoading(true);
    try {
      const createResumeRequestDto: CreateResumeRequestDto = {
        email: user.email,
        status: "PENDING",
        user: { id: parseInt(user.id) },
        job: { id: jobId },
      };

      const formData = new FormData();
      formData.append("pdfFile", selectedFile);
      formData.append(
        "resume",
        new Blob([JSON.stringify(createResumeRequestDto)], {
          type: "application/json",
        }),
      );

      await saveResume(formData);

      toast.success("Ứng tuyển thành công! Chúng tôi sẽ liên hệ với bạn sớm.");
      setIsModalOpen(false);
      setSelectedFile(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể Ứng tuyển"));
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
  };

  // =============================
  // HANDLE CV ANALYSIS
  // =============================
  const handleAnalyzeCV = async () => {
    if (!selectedFile) {
      toast.error("Vui lòng chọn file CV trước");
      return;
    }

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("pdfFile", selectedFile);

      const res = await analyzeResumePreview(formData, jobId);
      setAnalysisResult(res.data.data);
      toast.success("Phân tích CV hoàn tất!");
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể phân tích CV"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper to get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <>
      {/* Floating Apply Button - Rendered via Portal to ensure visibility */}
      {createPortal(
        <div className="fixed right-12 bottom-10 z-[9999]">
          <Button
            onClick={handleApplyClick}
            disabled={!canApply && isLogin}
            className={`border-2 border-white rounded-full px-8 py-4 text-base font-semibold shadow-lg transition-all duration-200 ${hasApplied
              ? "animate-pulse cursor-default bg-green-600 text-white shadow-green-300"
              : canApply || !isLogin
                ? "animate-bounce bg-orange-600 text-white hover:bg-orange-700 hover:shadow-xl"
                : "cursor-not-allowed bg-gray-300 text-gray-500"
              }`}
            size="lg"
          >
            {hasApplied ? (
              <>
                <CheckCircle2 className="mr-2 h-6 w-6" />
                Đã nộp hồ sơ
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                {canApply || !isLogin ? "Nộp CV" : jobExpired ? "Hết hạn" : "Đã đóng"}
              </>
            )}
          </Button>
        </div>,
        document.body
      )}

      {/* Apply Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="flex h-[95vh] max-h-[95vh] !w-2/3 !max-w-none flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">Ứng tuyển vị trí</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              {jobTitle}
            </DialogDescription>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col">
            {!selectedFile ? (
              <div
                className="flex flex-1 flex-col justify-center"
                onClick={openInput}
              >
                {/* Label */}
                <Label htmlFor="cv-upload" className="mb-4 text-sm font-medium">
                  Hồ sơ xin việc của bạn (PDF){" "}
                  <span className="text-red-500">*</span>
                </Label>

                {/* Input Field */}
                <div className="flex flex-1 flex-col justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center transition-colors hover:border-orange-400">
                  <Upload className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                  <div className="mb-4 text-lg text-gray-600">
                    Kéo thả file PDF vào đây hoặc{" "}
                    <span className="text-orange-500">nhấp để chọn file</span>
                  </div>
                  <Input
                    id="cv-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    ref={pdfInputRef}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      openInput();
                    }}
                    className="mx-auto"
                  >
                    Tải lên từ thiết bị
                  </Button>
                  <div className="mt-4 text-sm text-gray-500">Tối đa 5MB</div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {/* File Info Header - stays fixed */}
                <div className="mb-4 flex flex-shrink-0 items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-orange-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedFile.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* AI Analysis Button */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAnalyzeCV}
                      disabled={isAnalyzing}
                      className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Đang phân tích...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-1" />
                          Phân tích CV
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Scrollable content: Analysis Results + PDF Viewer */}
                <ScrollArea className="flex-1 min-h-0">
                  <div className="space-y-4 pr-2">
                    {/* CV Analysis Results */}
                    {analysisResult && (
                      <div className="mb-4 rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 p-4 space-y-4">
                        {/* Match Score */}
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-700">Độ phù hợp:</span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${getProgressColor(analysisResult.matchScore)}`}
                                style={{ width: `${analysisResult.matchScore}%` }}
                              />
                            </div>
                            <span className={`text-2xl font-bold ${getScoreColor(analysisResult.matchScore)}`}>
                              {analysisResult.matchScore}%
                            </span>
                          </div>
                        </div>

                        {/* Summary */}
                        <p className="text-sm text-gray-600 italic bg-white/50 rounded p-2">
                          {analysisResult.summary}
                        </p>

                        {/* Strengths & Weaknesses */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Strengths */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-green-600 font-medium text-sm">
                              <ThumbsUp className="h-4 w-4" />
                              Điểm mạnh
                            </div>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {analysisResult.strengths.map((s, i) => (
                                <li key={i} className="flex items-start gap-1">
                                  <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Weaknesses */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-yellow-600 font-medium text-sm">
                              <AlertTriangle className="h-4 w-4" />
                              Cần cải thiện
                            </div>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {analysisResult.weaknesses.map((w, i) => (
                                <li key={i} className="flex items-start gap-1">
                                  <X className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                                  {w}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Suggestions */}
                        {analysisResult.suggestions.length > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-blue-600 font-medium text-sm">
                              <Lightbulb className="h-4 w-4" />
                              Gợi ý
                            </div>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {analysisResult.suggestions.map((s, i) => (
                                <li key={i} className="flex items-start gap-1">
                                  <span className="text-blue-500 font-bold">•</span>
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* PDF Viewer */}
                    <div className="border-2 rounded">
                      <PDFViewer fileUrl={fileUrl} defaultScale={1} />
                    </div>
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Submit Buttons*/}
            <div className="flex flex-shrink-0 gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3"
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!selectedFile || isLoading}
                className="flex-1 bg-orange-600 py-3 hover:bg-orange-700"
              >
                {isLoading ? "Đang gửi..." : "Ứng tuyển"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
