import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { BetweenVerticalStart, Sparkles, Loader2, ThumbsUp, AlertTriangle, Lightbulb, CheckCircle2, X } from "lucide-react";

import type {
  ResumeForDisplayResponseDto,
  UpdateResumeStatusRequestDto,
} from "@/types/resume";
import PDFViewer from "@/components/custom/PDFViewer.tsx";
import RichTextPreview from "@/components/custom/RichText/index-preview.tsx";
import { statusOptions } from "@/utils/tagColorMapper.ts";
import { toast } from "sonner";
import { analyzeResume, type CVAnalysisResponse } from "@/services/resumeApi.ts";
import { getErrorMessage } from "@/features/slices/auth/authThunk.ts";

interface ViewResumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (resume: UpdateResumeStatusRequestDto) => Promise<void>;
  resume: ResumeForDisplayResponseDto;
  onCloseForm: () => void;
  theme?: "blue" | "purple";
}

export function ViewResumeDialog({
  open,
  onOpenChange,
  onUpdate,
  resume,
  onCloseForm,
  theme = "blue",
}: ViewResumeDialogProps) {
  const [status, setStatus] = useState(resume.status);
  const [openJobInfo, setOpenJobInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CVAnalysisResponse | null>(null);

  useEffect(() => {
    if (open) setStatus(resume.status);
    else {
      setStatus("");
      setOpenJobInfo(false);
      setAnalysisResult(null);
    }
  }, [open, resume.status]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate status
    if (!status || !resume.id) {
      toast.error("Vui lòng chọn trạng thái và đảm bảo hồ sơ hợp lệ");
      return;
    }

    const validStatuses = ["PENDING", "REVIEWING", "APPROVED", "REJECTED"];
    if (!validStatuses.includes(status)) {
      toast.error("Trạng thái không hợp lệ");
      return;
    }

    setIsLoading(true);
    try {
      const res: UpdateResumeStatusRequestDto = {
        id: resume.id,
        status,
      };
      await onUpdate(res);
      onOpenChange(false);
      onCloseForm?.();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeCV = async () => {
    if (!resume.id) {
      toast.error("Resume ID không hợp lệ");
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await analyzeResume(resume.id);
      setAnalysisResult(res.data.data);
      toast.success("Phân tích CV hoàn tất!");
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể phân tích CV"));
    } finally {
      setIsAnalyzing(false);
    }
  };

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`flex !h-11/12 !max-h-none !w-full !max-w-none flex-col ${openJobInfo ? "lg:!w-11/12" : "lg:!w-2/3"}`}
      >
        <DialogHeader>
          <DialogTitle className="text-center">Hồ sơ ứng cử viên</DialogTitle>
          <DialogDescription className="text-center">
            Thông tin chi tiết của ứng cử viên
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Button
            className={`w-fit hover:-translate-y-0.5 ${openJobInfo
              ? `border border-gray-100 text-white ${theme === "blue" ? "bg-blue-500 hover:bg-blue-600" : "bg-purple-500 hover:bg-purple-600"}`
              : `border bg-white hover:bg-white ${theme === "blue" ? "border-blue-500 text-blue-500" : "border-purple-500 text-purple-500"}`
              }`}
            onClick={() => setOpenJobInfo((v) => !v)}
          >
            <BetweenVerticalStart />
            {openJobInfo ? "Ẩn Job Info" : "Xem Job Info"}
          </Button>

          <Button
            className="w-fit hover:-translate-y-0.5 border border-purple-300 bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600"
            onClick={handleAnalyzeCV}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Đang phân tích...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1" />
                Phân tích CV bằng AI
              </>
            )}
          </Button>
        </div>

        {/* AI Analysis Results */}
        {analysisResult && (
          <div className="rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 p-4 space-y-3">
            {/* Match Score */}
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Độ phù hợp với công việc:</span>
              <div className="flex items-center gap-3">
                <div className="w-40 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${getProgressColor(analysisResult.matchScore)}`}
                    style={{ width: `${analysisResult.matchScore}%` }}
                  />
                </div>
                <span className={`text-3xl font-bold ${getScoreColor(analysisResult.matchScore)}`}>
                  {analysisResult.matchScore}%
                </span>
              </div>
            </div>

            {/* Summary */}
            <p className="text-sm text-gray-600 italic bg-white/50 rounded p-2">
              {analysisResult.summary}
            </p>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
          </div>
        )}

        {!openJobInfo && (
          <ScrollArea className="h-3/4">
            <PDFViewer fileUrl={resume.pdfUrl} />
          </ScrollArea>
        )}

        {openJobInfo && (
          <div className="mt-2 min-h-0 flex-1">
            <div className="grid h-full w-full grid-cols-2 gap-12">
              {/* Cột 1: PDF */}

              <ScrollArea className="h-full min-h-0 border px-2">
                <h1 className="my-4 text-center text-3xl font-bold">
                  Hồ sơ ứng cử viên
                </h1>
                <PDFViewer fileUrl={resume.pdfUrl} />
              </ScrollArea>

              {/* Cột 2: Thông tin Job */}
              <ScrollArea className="h-full min-h-0 border px-2">
                <h1 className="my-4 text-center text-3xl font-bold">
                  Thông tin công việc
                </h1>
                <div className="flex h-full flex-col space-y-5">
                  <div>
                    <span className="font-semibold text-gray-700">
                      Kỹ năng yêu cầu:
                    </span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {resume.job.skills.map((skill) => (
                        <Badge
                          key={skill}
                          className={`${theme === "blue" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-gray-700">
                      Mô tả công việc:
                    </span>
                    <RichTextPreview content={resume.job.description} />
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem value={opt.value} key={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleUpdate}
            className={`cursor-pointer ${theme === "blue" ? "bg-blue-500 hover:bg-blue-600" : "bg-purple-500 hover:bg-purple-600"}`}
            disabled={isLoading}
          >
            Cập nhật
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
