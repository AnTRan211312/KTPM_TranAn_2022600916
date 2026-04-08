import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, Download, Loader2, Sparkles, Eye, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getErrorMessage } from "@/features/slices/auth/authThunk";
import { createUserCV, updateUserCV, getCVById, generateCVAiSuggestionStream } from "@/services/userCvApi";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
    INITIAL_CV_DATA,
    CV_TEMPLATES,
    type CVData,
    type CVPersonalInfo,
    type CVEducation,
    type CVExperience,
    type CVSkill,
} from "@/types/cv";
import { PersonalInfoForm } from "@/pages/user/cv-builder-page/components/PersonalInfoForm";
import { EducationForm } from "@/pages/user/cv-builder-page/components/EducationForm";
import { ExperienceForm } from "@/pages/user/cv-builder-page/components/ExperienceForm";
import { SkillsForm } from "@/pages/user/cv-builder-page/components/SkillsForm";
import { CVPreview } from "@/pages/user/cv-builder-page/components/CVPreview";

export default function CVEditorPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const previewRef = useRef<HTMLDivElement>(null);

    const isNew = id === "new";
    const templateId = searchParams.get("template") || "modern";

    const [cvName, setCvName] = useState("CV của tôi");
    const [cvData, setCvData] = useState<CVData>(INITIAL_CV_DATA);
    const [selectedTemplate, setSelectedTemplate] = useState(templateId);
    const [isLoading, setIsLoading] = useState(!isNew);
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState("personal");
    const [viewMode, setViewMode] = useState<"split" | "preview">("split");

    useEffect(() => {
        if (!isNew && id) {
            loadCV(parseInt(id));
        }
    }, [id, isNew]);

    const loadCV = async (cvId: number) => {
        try {
            const response = await getCVById(cvId);
            const cv = response.data.data;
            setCvName(cv.name);
            setSelectedTemplate(cv.templateId);
            setCvData(JSON.parse(cv.cvData));
        } catch (error) {
            toast.error(getErrorMessage(error, "Không thể tải CV"));
            navigate("/user/cv-builder");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!cvName.trim()) {
            toast.error("Vui lòng nhập tên CV");
            return;
        }

        setIsSaving(true);
        try {
            const cvDataString = JSON.stringify(cvData);

            if (isNew) {
                await createUserCV({
                    name: cvName,
                    templateId: selectedTemplate,
                    cvData: cvDataString,
                });
                toast.success("Đã tạo CV thành công!");
            } else {
                await updateUserCV({
                    id: parseInt(id!),
                    name: cvName,
                    templateId: selectedTemplate,
                    cvData: cvDataString,
                });
                toast.success("Đã lưu CV thành công!");
            }

            navigate("/user/cv-builder");
        } catch (error) {
            toast.error(getErrorMessage(error, "Không thể lưu CV"));
        } finally {
            setIsSaving(false);
        }
    };

    const handleExportPDF = async () => {
        if (!previewRef.current) {
            toast.error("Không tìm thấy preview để xuất PDF");
            return;
        }

        setIsExporting(true);
        toast.info("Đang chuẩn bị bản in, vui lòng đợi trong giây lát...", { duration: 2000 });

        // Tạo container ẩn để chứa bản sao đã được làm sạch
        const ghostContainer = document.createElement('div');
        ghostContainer.style.position = 'absolute';
        ghostContainer.style.top = '-9999px';
        ghostContainer.style.left = '-9999px';
        ghostContainer.style.width = `${previewRef.current.offsetWidth}px`;
        document.body.appendChild(ghostContainer);

        try {
            const originalElement = previewRef.current;
            if (!originalElement) throw new Error("Không tìm thấy phần tử gốc.");

            await document.fonts.ready;

            // 1. Deep Clone for safe modification
            const clone = originalElement.cloneNode(true) as HTMLElement;
            ghostContainer.appendChild(clone);

            // 2. Color Sanitizer Helper: Convert oklch -> rbg/hex
            const canvasHelper = document.createElement('canvas');
            const ctx = canvasHelper.getContext('2d');
            const getSafeColor = (c: string) => {
                if (!c || !ctx) return c;
                if (c.includes('oklch') || c.includes('lab') || c.includes('display-p3')) {
                    try {
                        ctx.fillStyle = c;
                        return ctx.fillStyle;
                    } catch {
                        return '#000000';
                    }
                }
                return c;
            };

            // 3. Flatten Styles onto Clone
            const srcElements = originalElement.querySelectorAll('*');
            const dstElements = clone.querySelectorAll('*');

            // Apply root styles
            const rootStyle = window.getComputedStyle(originalElement);
            clone.style.backgroundColor = getSafeColor(rootStyle.backgroundColor);
            clone.style.color = getSafeColor(rootStyle.color);

            srcElements.forEach((src, i) => {
                const dst = dstElements[i] as HTMLElement;
                if (!dst) return;

                const s = window.getComputedStyle(src);

                if (s.color) dst.style.color = getSafeColor(s.color);
                if (s.backgroundColor) dst.style.backgroundColor = getSafeColor(s.backgroundColor);
                if (s.borderColor) dst.style.borderColor = getSafeColor(s.borderColor);

                if (s.backgroundImage !== 'none') {
                    if (s.backgroundImage.includes('gradient') || s.backgroundImage.includes('oklch')) {
                        dst.style.backgroundImage = 'none';
                        const safeBg = getSafeColor(s.backgroundColor);
                        if (safeBg !== 'rgba(0, 0, 0, 0)' && safeBg) {
                            dst.style.backgroundColor = safeBg;
                        } else {
                            dst.style.backgroundColor = '#ffffff';
                        }
                    }
                }

                dst.style.boxShadow = 'none';
                dst.style.textShadow = 'none';
            });

            // 4. Render html2canvas on cleaned clone
            const canvas = await html2canvas(clone, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#ffffff",
                logging: false,
                onclone: (clonedDoc) => {
                    // 5. Global Variable Override (for Pseudo-elements)
                    const rootComputed = window.getComputedStyle(document.documentElement);
                    const cssVars = [
                        "--background", "--foreground", "--card", "--card-foreground",
                        "--popover", "--popover-foreground", "--primary", "--primary-foreground",
                        "--secondary", "--secondary-foreground", "--muted", "--muted-foreground",
                        "--accent", "--accent-foreground", "--destructive", "--destructive-foreground",
                        "--border", "--input", "--ring"
                    ];

                    const overrides = cssVars.map(v => {
                        const val = rootComputed.getPropertyValue(v).trim();
                        if (val && (val.includes('oklch') || val.includes('lab'))) {
                            return `${v}: ${getSafeColor(val)} !important;`;
                        }
                        return null;
                    }).filter(Boolean).join('\n');

                    const style = clonedDoc.createElement('style');
                    style.innerHTML = `
                    :root { ${overrides} } 
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                `;
                    clonedDoc.head.appendChild(style);
                }
            });

            if (!canvas || canvas.width === 0 || canvas.height === 0) {
                throw new Error("Lỗi render canvas: kích thước bằng 0.");
            }

            const imgData = canvas.toDataURL("image/jpeg", 0.95);
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(imgData);
            const ratio = pdfWidth / imgProps.width;

            pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, imgProps.height * ratio);

            const safeFileName = (cvName || "CV")
                .replace(/[/\\?%*:|"<>]/g, "-")
                .replace(/\s+/g, "_")
                .trim();

            pdf.save(`${safeFileName}.pdf`);
            toast.success("Tải CV thành công!");
        } catch (error: any) {
            console.error("PDF Export Error:", error);
            const isAddColorStopError = error.message?.includes("addColorStop");
            const detail = isAddColorStopError ? "Lỗi dải màu Gradient." : error.message;
            toast.error(`Lỗi xuất PDF: ${detail}. Bạn vui lòng chụp màn hình nếu cần gấp nhé.`);
        } finally {
            if (document.body.contains(ghostContainer)) {
                document.body.removeChild(ghostContainer);
            }
            setIsExporting(false);
        }
    };

    const handleAiSuggest = async () => {
        setIsAiGenerating(true);
        let accumulatedAIResponse = "";

        try {
            generateCVAiSuggestionStream(
                JSON.stringify(cvData),
                (chunk) => {
                    accumulatedAIResponse += chunk;
                },
                () => {
                    // onComplete
                    setIsAiGenerating(false);
                    try {
                        // Trích xuất JSON từ phản hồi (đề phòng AI trả về code block)
                        const jsonMatch = accumulatedAIResponse.match(/\{[\s\S]*\}/);
                        const jsonStr = jsonMatch ? jsonMatch[0] : accumulatedAIResponse;
                        const parsedData = JSON.parse(jsonStr);

                        setCvData(parsedData);
                        toast.success("AI đã tối ưu hóa nội dung CV của bạn!");
                    } catch (e) {
                        console.error("AI Response Parse Error:", accumulatedAIResponse, e);
                        toast.error("AI phản hồi không đúng cấu trúc dữ liệu. Vui lòng thử lại.");
                    }
                },
                (error: any) => {
                    // onError
                    setIsAiGenerating(false);
                    console.error("AI connection error:", error);
                    const errorMsg = error.message || "Lỗi server (500)";
                    toast.error(`Lỗi AI: ${errorMsg}. Vui lòng kiểm tra lại cấu hình Gemini Backend.`);
                }
            );
        } catch (error: any) {
            setIsAiGenerating(false);
            toast.error(getErrorMessage(error, "Không thể khởi tạo AI gợi ý"));
        }
    };


    const updateCVData = <K extends keyof CVData>(
        section: K,
        data: CVData[K]
    ) => {
        setCvData((prev) => ({
            ...prev,
            [section]: data,
        }));
    };

    const currentTemplate = CV_TEMPLATES.find(t => t.id === selectedTemplate);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-orange-500" />
                    <p className="mt-4 text-gray-600">Đang tải CV...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-orange-50">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md shadow-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate("/user/cv-builder")}
                            className="gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Quay lại</span>
                        </Button>
                        <div className="h-6 w-px bg-gray-200" />
                        <div className="flex items-center gap-3">
                            <Input
                                value={cvName}
                                onChange={(e) => setCvName(e.target.value)}
                                className="w-48 border-none bg-gray-50 font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-orange-500 sm:w-64"
                                placeholder="Tên CV..."
                            />
                            {currentTemplate && (
                                <div
                                    className="hidden items-center gap-2 rounded-full px-3 py-1 text-xs font-medium sm:flex"
                                    style={{
                                        backgroundColor: `${currentTemplate.primaryColor}15`,
                                        color: currentTemplate.primaryColor
                                    }}
                                >
                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: currentTemplate.primaryColor }} />
                                    {currentTemplate.name}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden rounded-lg border bg-gray-50 p-1 md:flex">
                            <Button
                                variant={viewMode === "split" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setViewMode("split")}
                                className="gap-1.5"
                            >
                                <Edit3 className="h-3.5 w-3.5" />
                                Chỉnh sửa
                            </Button>
                            <Button
                                variant={viewMode === "preview" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setViewMode("preview")}
                                className="gap-1.5"
                            >
                                <Eye className="h-3.5 w-3.5" />
                                Xem trước
                            </Button>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={handleExportPDF}
                            disabled={isExporting}
                        >
                            {isExporting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4" />
                            )}
                            <span className="hidden sm:inline">Tải PDF</span>
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            size="sm"
                            className="gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25"
                        >
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            Lưu CV
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="mx-auto max-w-7xl p-4 md:p-6">
                <div className={`flex gap-6 ${viewMode === "preview" ? "justify-center" : ""}`}>
                    {/* Left Panel - Form */}
                    {viewMode === "split" && (
                        <div className="w-full rounded-2xl bg-white p-6 shadow-xl shadow-gray-200/50 md:w-1/2">
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="mb-6 grid w-full grid-cols-4 rounded-xl bg-gray-100 p-1">
                                    <TabsTrigger
                                        value="personal"
                                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                    >
                                        Cá nhân
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="experience"
                                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                    >
                                        Kinh nghiệm
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="education"
                                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                    >
                                        Học vấn
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="skills"
                                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                    >
                                        Kỹ năng
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="personal" className="mt-0">
                                    <PersonalInfoForm
                                        data={cvData.personalInfo}
                                        onChange={(data: CVPersonalInfo) => updateCVData("personalInfo", data)}
                                    />
                                </TabsContent>

                                <TabsContent value="experience" className="mt-0">
                                    <ExperienceForm
                                        data={cvData.experience}
                                        onChange={(data: CVExperience[]) => updateCVData("experience", data)}
                                    />
                                </TabsContent>

                                <TabsContent value="education" className="mt-0">
                                    <EducationForm
                                        data={cvData.education}
                                        onChange={(data: CVEducation[]) => updateCVData("education", data)}
                                    />
                                </TabsContent>

                                <TabsContent value="skills" className="mt-0">
                                    <SkillsForm
                                        data={cvData.skills}
                                        onChange={(data: CVSkill[]) => updateCVData("skills", data)}
                                    />
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}

                    {/* Right Panel - Preview */}
                    <div className={viewMode === "preview" ? "w-full max-w-2xl" : "hidden md:block md:w-1/2"}>
                        <div className="sticky top-24">
                            <div className="mb-4 flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
                                <h3 className="flex items-center gap-2 font-semibold text-gray-700">
                                    <Eye className="h-4 w-4 text-gray-400" />
                                    Xem trước CV
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleAiSuggest}
                                    disabled={isAiGenerating}
                                    className="gap-2 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                                >
                                    {isAiGenerating ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Sparkles className="h-4 w-4" />
                                    )}
                                    {isAiGenerating ? "Đang gợi ý..." : "AI Gợi ý"}
                                </Button>
                            </div>
                            <div
                                ref={previewRef}
                                className="overflow-hidden"
                                style={{
                                    borderRadius: "12px",
                                    backgroundColor: "#ffffff"
                                }}
                            >
                                <CVPreview
                                    cvData={cvData}
                                    templateId={selectedTemplate}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
