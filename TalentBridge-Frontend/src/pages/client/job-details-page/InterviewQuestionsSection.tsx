import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { Sparkles, Loader2, RotateCcw, BrainCircuit } from "lucide-react";
import { generateInterviewQuestionsStream } from "@/services/jobApi.ts";
import { toast } from "sonner";

interface InterviewQuestionsSectionProps {
  jobId: number;
  jobName: string;
}

const InterviewQuestionsSection = ({ jobId, jobName }: InterviewQuestionsSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [content, setContent] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const contentEndRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Auto-scroll to bottom as content streams
  useEffect(() => {
    if (contentEndRef.current && isGenerating) {
      contentEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [content, isGenerating]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  const handleGenerate = () => {
    setIsGenerating(true);
    setContent("");
    setStatusMessage("Khởi tạo...");
    setHasGenerated(true);

    let accumulatedContent = "";

    const cleanup = generateInterviewQuestionsStream(
      jobId,
      (chunk) => {
        try {
          if (chunk.startsWith("{") && chunk.includes('"phase"')) {
            const data = JSON.parse(chunk);
            setStatusMessage(data.message || "Đang xử lý...");
            return;
          }
          accumulatedContent += chunk;
          setContent(accumulatedContent);
        } catch {
          accumulatedContent += chunk;
          setContent(accumulatedContent);
        }
      },
      () => {
        setIsGenerating(false);
        setStatusMessage("");
        toast.success("Đã tạo xong bộ câu hỏi phỏng vấn!");
      },
      (error) => {
        setIsGenerating(false);
        setStatusMessage("");
        console.error("Interview questions streaming error:", error);
        toast.error("Lỗi khi tạo câu hỏi phỏng vấn. Vui lòng thử lại.");
      }
    );

    cleanupRef.current = cleanup;
  };

  const handleOpenAndGenerate = () => {
    setIsOpen(true);
    if (!hasGenerated) {
      // Auto-generate on first open
      setTimeout(() => handleGenerate(), 300);
    }
  };

  // Render markdown-like content with proper formatting
  const renderContent = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // --- Horizontal rule
      if (trimmed === "---" || trimmed === "***") {
        elements.push(
          <hr key={i} className="my-6 border-purple-200" />
        );
        continue;
      }

      // ## Section Header
      if (trimmed.startsWith("## ")) {
        elements.push(
          <div key={i} className="mt-8 mb-4 first:mt-0">
            <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 border-b-2 border-purple-200 pb-3">
              {trimmed.replace("## ", "")}
            </h3>
          </div>
        );
        continue;
      }

      // ### Sub-header
      if (trimmed.startsWith("### ")) {
        elements.push(
          <h4 key={i} className="mt-5 mb-2 text-base font-semibold text-gray-800">
            {trimmed.replace("### ", "")}
          </h4>
        );
        continue;
      }

      // Bold numbered question: **1. Question?**
      const boldNumberedMatch = trimmed.match(/^\*\*(\d+)\.\s+(.*?)\*\*$/);
      if (boldNumberedMatch) {
        elements.push(
          <div key={i} className="mt-6 mb-2 flex gap-3 items-start bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
            <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-purple-600 text-sm font-bold text-white shadow-sm">
              {boldNumberedMatch[1]}
            </span>
            <p className="text-base font-semibold text-gray-900 leading-relaxed pt-1">
              {boldNumberedMatch[2]}
            </p>
          </div>
        );
        continue;
      }

      // Regular numbered item: 1. question
      const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numberedMatch) {
        elements.push(
          <div key={i} className="mt-6 mb-2 flex gap-3 items-start bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
            <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-purple-600 text-sm font-bold text-white shadow-sm">
              {numberedMatch[1]}
            </span>
            <p className="text-base font-semibold text-gray-900 leading-relaxed pt-1"
              dangerouslySetInnerHTML={{
                __html: numberedMatch[2]
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
              }}
            />
          </div>
        );
        continue;
      }

      // **Gợi ý trả lời:** text
      const hintMatch = trimmed.match(/^\*\*Gợi ý trả lời:\*\*\s*(.*)/);
      if (hintMatch) {
        elements.push(
          <div key={i} className="ml-11 mb-2 rounded-lg bg-green-50 border border-green-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-green-700 uppercase tracking-wider bg-green-100 px-2 py-0.5 rounded">
                💡 Gợi ý trả lời
              </span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: hintMatch[1]
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900">$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/`(.*?)`/g, '<code class="bg-gray-100 text-purple-700 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
              }}
            />
          </div>
        );
        continue;
      }

      // Bullet points
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const bulletContent = trimmed.replace(/^[-*]\s+/, "");
        elements.push(
          <div key={i} className="flex gap-2 py-1 pl-4 ml-11">
            <span className="text-purple-500 mt-1 flex-shrink-0">•</span>
            <span className="text-sm text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: bulletContent
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900">$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/`(.*?)`/g, '<code class="bg-gray-100 text-purple-700 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
              }}
            />
          </div>
        );
        continue;
      }

      // Bold-only line
      if (trimmed.startsWith("**") && trimmed.endsWith("**") && !trimmed.includes("Gợi ý")) {
        elements.push(
          <p key={i} className="mt-3 mb-1 text-sm font-bold text-gray-800">
            {trimmed.replace(/\*\*/g, "")}
          </p>
        );
        continue;
      }

      // Empty line = spacer
      if (!trimmed) {
        elements.push(<div key={i} className="h-1" />);
        continue;
      }

      // Regular paragraph
      elements.push(
        <p key={i} className="text-sm text-gray-700 leading-relaxed ml-11"
          dangerouslySetInnerHTML={{
            __html: trimmed
              .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900">$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/`(.*?)`/g, '<code class="bg-gray-100 text-purple-700 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
          }}
        />
      );
    }

    return elements;
  };

  return (
    <>
      {/* Floating AI Button - Always visible via Portal */}
      {createPortal(
        <div className="fixed left-6 bottom-6 z-[9998]">
          <Button
            onClick={handleOpenAndGenerate}
            className="group relative h-14 w-14 rounded-full bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-0 shadow-xl shadow-purple-300/50 transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-purple-400/60"
            title="Gợi ý câu hỏi phỏng vấn bằng AI"
          >
            <BrainCircuit className="h-7 w-7 text-white transition-transform group-hover:rotate-12" />

            {/* Pulse animation ring */}
            <span className="absolute inset-0 rounded-full animate-ping bg-purple-400 opacity-20" />

            {/* Tooltip on hover */}
            <span className="absolute left-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 pointer-events-none">
              🤖 Câu hỏi phỏng vấn AI
              <span className="absolute top-1/2 -left-1 -translate-y-1/2 h-2 w-2 rotate-45 bg-gray-900" />
            </span>
          </Button>
        </div>,
        document.body
      )}

      {/* Full Dialog for Interview Questions */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="flex h-[90vh] max-h-[90vh] !w-[720px] !max-w-[90vw] flex-col p-0 gap-0 overflow-hidden">
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-6 py-5 flex-shrink-0">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
                <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                  <BrainCircuit className="h-6 w-6 text-white" />
                </div>
                Câu hỏi phỏng vấn AI
              </DialogTitle>
              <DialogDescription className="text-purple-100 mt-1">
                {jobName}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {!hasGenerated ? (
              /* Initial CTA */
              <div className="flex flex-col items-center justify-center h-full py-12 px-8 text-center">
                <div className="mb-6 rounded-full bg-purple-50 p-6">
                  <Sparkles className="h-14 w-14 text-purple-500" />
                </div>
                <h4 className="mb-3 text-xl font-bold text-gray-800">
                  Chuẩn bị cho buổi phỏng vấn
                </h4>
                <p className="mb-8 max-w-md text-sm text-gray-500 leading-relaxed">
                  AI sẽ phân tích yêu cầu công việc, kỹ năng cần thiết và tạo bộ câu hỏi phỏng vấn
                  phù hợp giúp bạn tự tin hơn.
                </p>
                <Button
                  onClick={handleGenerate}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-purple-200 transition-all hover:shadow-xl hover:shadow-purple-300 hover:from-purple-700 hover:to-indigo-700"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Tạo câu hỏi phỏng vấn
                </Button>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {/* Loading indicator */}
                {isGenerating && (
                  <div className="flex items-center gap-3 bg-purple-50 border-b border-purple-100 px-6 py-3 flex-shrink-0">
                    <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">
                      {statusMessage || "Đang xử lý..."}
                    </span>
                    <div className="ml-auto flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="h-2 w-2 rounded-full bg-purple-400 animate-bounce"
                          style={{ animationDelay: `${i * 150}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Scrollable streamed content */}
                <ScrollArea className="flex-1 min-h-0">
                  <div className="px-6 py-6">
                    {content && renderContent(content)}
                    <div ref={contentEndRef} />
                  </div>
                </ScrollArea>

                {/* Footer with regenerate */}
                {!isGenerating && content && (
                  <div className="flex justify-center items-center gap-3 py-4 px-6 border-t bg-gray-50/80 flex-shrink-0">
                    <Button
                      onClick={handleGenerate}
                      variant="outline"
                      className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Tạo lại câu hỏi
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InterviewQuestionsSection;
