import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button.tsx";
import { Send, Upload, X, FileText, CheckCircle2, Sparkles, AlertTriangle, ThumbsUp, Lightbulb, Loader2, FolderOpen, Building2, Briefcase, Clock } from "lucide-react";
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
import type { CreateResumeRequestDto, UserResumeFileDto } from "@/types/resume";
import { saveResume, checkApplied, analyzeResumePreviewStream, analyzeExistingResumeStream, getUserResumeFiles, type CVAnalysisResponse } from "@/services/resumeApi.ts";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { checkFileSizeAndFileType } from "@/utils/fileMetadata.ts";
import { isJobExpired } from "@/utils/jobStatusHelper.ts";

type CVSourceMode = "upload" | "existing";

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

  // New states for existing CV feature
  const [cvSourceMode, setCvSourceMode] = useState<CVSourceMode>("upload");
  const [existingResumes, setExistingResumes] = useState<UserResumeFileDto[]>([]);
  const [selectedExistingResumeId, setSelectedExistingResumeId] = useState<number | null>(null);
  const [isLoadingExistingResumes, setIsLoadingExistingResumes] = useState(false);

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

  // Fetch existing resumes when modal opens and user selects "existing" tab
  useEffect(() => {
    if (isModalOpen && isLogin && cvSourceMode === "existing" && existingResumes.length === 0) {
      fetchExistingResumes();
    }
  }, [isModalOpen, isLogin, cvSourceMode]);

  const fetchExistingResumes = async () => {
    setIsLoadingExistingResumes(true);
    try {
      const res = await getUserResumeFiles();
      setExistingResumes(res.data.data);
    } catch (err) {
      console.error("Failed to fetch existing resumes:", err);
      toast.error("Không thể tải danh sách CV đã nộp");
    } finally {
      setIsLoadingExistingResumes(false);
    }
  };

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

  // Get preview URL for selected CV (either uploaded or existing)
  const previewUrl = useMemo(() => {
    if (selectedFile) return fileUrl;
    if (selectedExistingResumeId) {
      const existing = existingResumes.find(r => r.resumeId === selectedExistingResumeId);
      return existing?.pdfUrl || "";
    }
    return "";
  }, [selectedFile, fileUrl, selectedExistingResumeId, existingResumes]);

  // Check if a CV is selected (either uploaded or from existing)
  const hasCVSelected = selectedFile !== null || selectedExistingResumeId !== null;

  // Get display name for selected CV
  const selectedCVName = useMemo(() => {
    if (selectedFile) return selectedFile.name;
    if (selectedExistingResumeId) {
      const existing = existingResumes.find(r => r.resumeId === selectedExistingResumeId);
      return existing ? `CV - ${existing.jobName} (${existing.companyName})` : "";
    }
    return "";
  }, [selectedFile, selectedExistingResumeId, existingResumes]);

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
      setSelectedExistingResumeId(null); // Clear existing selection
    }
  };

  const handleSelectExistingResume = (resumeId: number) => {
    setSelectedExistingResumeId(resumeId);
    setSelectedFile(null); // Clear uploaded file
    setAnalysisResult(null); // Clear analysis
  };

  // =============================
  // HANDLE ACTION
  // =============================

  const handleSubmit = async () => {
    if (!hasCVSelected) {
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
      if (selectedFile) {
        formData.append("pdfFile", selectedFile);
      }
      formData.append(
        "resume",
        new Blob([JSON.stringify(createResumeRequestDto)], {
          type: "application/json",
        }),
      );

      await saveResume(formData, selectedExistingResumeId ?? undefined);

      toast.success("Ứng tuyển thành công! Chúng tôi sẽ liên hệ với bạn sớm.");
      setIsModalOpen(false);
      setSelectedFile(null);
      setSelectedExistingResumeId(null);
      setHasApplied(true);
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể Ứng tuyển"));
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setSelectedExistingResumeId(null);
    setAnalysisResult(null);
  };

  // =============================
  // HANDLE CV ANALYSIS
  // =============================
  const [analysisStatus, setAnalysisStatus] = useState<string>("");

  const handleAnalyzeCV = async () => {
    if (!selectedFile && !selectedExistingResumeId) {
      toast.error("Vui lòng chọn CV trước khi phân tích");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisStatus("Khởi tạo...");

    try {
      let accumulatedAIResponse = "";

      const onChunk = (chunk: string) => {
        try {
          if (chunk.startsWith("{") && chunk.includes('"phase"')) {
            const data = JSON.parse(chunk);
            setAnalysisStatus(data.message || "Đang xử lý...");
            return;
          }
          accumulatedAIResponse += chunk;
        } catch (e) {
          accumulatedAIResponse += chunk;
        }
      };

      const onComplete = () => {
        setIsAnalyzing(false);
        setAnalysisStatus("");
        try {
          const jsonMatch = accumulatedAIResponse.match(/\{[\s\S]*\}/);
          const jsonStr = jsonMatch ? jsonMatch[0] : accumulatedAIResponse;
          const parsed = JSON.parse(jsonStr);
          setAnalysisResult(parsed);
          toast.success("Phân tích CV hoàn tất!");
        } catch (e) {
          console.error("Failed to parse AI response:", accumulatedAIResponse);
          toast.error("Lỗi phân tích kết quả AI. Vui lòng thử lại.");
        }
      };

      const onError = (error: Error) => {
        setIsAnalyzing(false);
        setAnalysisStatus("");
        console.error("Streaming error:", error);
        toast.error("Lỗi kết nối khi phân tích CV");
      };

      if (selectedFile) {
        // Phân tích CV mới upload
        const formData = new FormData();
        formData.append("pdfFile", selectedFile);
        analyzeResumePreviewStream(formData, jobId, onChunk, onComplete, onError);
      } else if (selectedExistingResumeId) {
        // Phân tích CV đã nộp trước đó
        analyzeExistingResumeStream(selectedExistingResumeId, jobId, onChunk, onComplete, onError);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể bắt đầu phân tích CV"));
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

  // Switch tab handler
  const handleSwitchTab = (mode: CVSourceMode) => {
    setCvSourceMode(mode);
    // Don't clear selections when switching tabs - let user switch back
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
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
            {!hasCVSelected ? (
              <div className="flex flex-1 flex-col overflow-hidden">
                {/* Tab Switcher */}
                <div className="mb-4 flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                  <button
                    type="button"
                    onClick={() => handleSwitchTab("upload")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                      cvSourceMode === "upload"
                        ? "bg-white text-orange-600 shadow-sm border border-orange-200"
                        : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    Tải CV mới
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchTab("existing")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                      cvSourceMode === "existing"
                        ? "bg-white text-orange-600 shadow-sm border border-orange-200"
                        : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                    }`}
                  >
                    <FolderOpen className="h-4 w-4" />
                    CV đã nộp
                  </button>
                </div>

                {/* Upload Tab */}
                {cvSourceMode === "upload" && (
                  <div
                    className="flex flex-1 flex-col justify-center"
                    onClick={openInput}
                  >
                    <Label htmlFor="cv-upload" className="mb-4 text-sm font-medium">
                      Hồ sơ xin việc của bạn (PDF){" "}
                      <span className="text-red-500">*</span>
                    </Label>

                    <div className="flex flex-1 flex-col justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center transition-colors hover:border-orange-400 cursor-pointer">
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
                )}

                {/* Existing CV Tab */}
                {cvSourceMode === "existing" && (
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <Label className="mb-4 text-sm font-medium">
                      Chọn CV đã nộp trước đó
                    </Label>

                    {isLoadingExistingResumes ? (
                      <div className="flex flex-1 items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                          <p className="text-sm text-gray-500">Đang tải danh sách CV...</p>
                        </div>
                      </div>
                    ) : existingResumes.length === 0 ? (
                      <div className="flex flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 p-8">
                        <FileText className="mb-4 h-16 w-16 text-gray-300" />
                        <p className="text-lg font-medium text-gray-500">Chưa có CV nào được nộp</p>
                        <p className="mt-2 text-sm text-gray-400">
                          Hãy tải lên CV mới để bắt đầu ứng tuyển
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-4"
                          onClick={() => handleSwitchTab("upload")}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Tải CV mới
                        </Button>
                      </div>
                    ) : (
                      <ScrollArea className="flex-1 min-h-0">
                        <div className="space-y-3 pr-2">
                          {existingResumes.map((resume, index) => (
                            <button
                              key={resume.resumeId}
                              type="button"
                              onClick={() => handleSelectExistingResume(resume.resumeId)}
                              className={`group w-full rounded-xl border-2 p-4 text-left transition-all duration-200 hover:shadow-lg ${
                                selectedExistingResumeId === resume.resumeId
                                  ? "border-orange-500 bg-orange-50/50 shadow-md ring-1 ring-orange-200"
                                  : "border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50/20"
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`flex h-14 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-colors ${
                                  selectedExistingResumeId === resume.resumeId
                                    ? "bg-orange-600 text-white shadow-lg shadow-orange-200"
                                    : "bg-orange-50 text-orange-400 group-hover:bg-orange-100 group-hover:text-orange-500"
                                }`}>
                                  <FileText className="h-7 w-7" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-base font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                                      Bản CV #{existingResumes.length - index}
                                    </h4>
                                    {index === 0 && (
                                       <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Mới nhất</span>
                                    )}
                                  </div>
                                  <div className="mt-1 flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                      <Briefcase className="h-3.5 w-3.5 text-gray-400" />
                                      <p className="truncate">Sử dụng cho: <span className="font-medium">{resume.jobName}</span></p>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1">
                                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                        <Building2 className="h-3 w-3" />
                                        <span className="truncate">{resume.companyName}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-xs text-gray-400 border-l border-gray-200 pl-4">
                                        <Clock className="h-3 w-3" />
                                        <span>Ngày nộp: {formatDate(resume.createdAt)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {selectedExistingResumeId === resume.resumeId && (
                                  <div className="h-6 w-6 rounded-full bg-orange-600 flex items-center justify-center ring-4 ring-orange-100">
                                    <CheckCircle2 className="h-4 w-4 text-white" />
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {/* File Info Header - stays fixed */}
                <div className="mb-4 flex flex-shrink-0 items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-orange-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedCVName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {selectedFile
                          ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                          : selectedExistingResumeId
                            ? "CV đã nộp trước đó"
                            : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* AI Analysis Button - for both uploaded and existing CVs */}
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
                          {analysisStatus}
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
                      <PDFViewer fileUrl={previewUrl} defaultScale={1} />
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
                disabled={!hasCVSelected || isLoading}
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
