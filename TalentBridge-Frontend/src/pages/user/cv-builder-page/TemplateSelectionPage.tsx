import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CV_TEMPLATES, type CVTemplate } from "@/types/cv";

export default function TemplateSelectionPage() {
    const navigate = useNavigate();
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

    const handleContinue = () => {
        if (selectedTemplate) {
            navigate(`/user/cv-builder/edit/new?template=${selectedTemplate}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-6xl px-4">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/user/cv-builder")}
                        className="mb-4 gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900">Chọn Template</h1>
                    <p className="mt-2 text-gray-600">
                        Chọn một template để bắt đầu tạo CV của bạn
                    </p>
                </div>

                {/* Templates Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {CV_TEMPLATES.map((template) => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            isSelected={selectedTemplate === template.id}
                            onSelect={() => setSelectedTemplate(template.id)}
                        />
                    ))}
                </div>

                {/* Continue Button */}
                <div className="mt-8 flex justify-center">
                    <Button
                        onClick={handleContinue}
                        disabled={!selectedTemplate}
                        className="gap-2 bg-orange-500 px-8 hover:bg-orange-600"
                        size="lg"
                    >
                        Tiếp tục
                        <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

interface TemplateCardProps {
    template: CVTemplate;
    isSelected: boolean;
    onSelect: () => void;
}

function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
    return (
        <Card
            className={`cursor-pointer overflow-hidden transition-all hover:shadow-lg ${isSelected
                ? "ring-2 ring-orange-500 ring-offset-2"
                : "hover:ring-1 hover:ring-gray-200"
                }`}
            onClick={onSelect}
        >
            {/* Preview Image Placeholder */}
            <div
                className="relative flex h-48 items-center justify-center"
                style={{ backgroundColor: template.primaryColor + "15" }}
            >
                <div
                    className="flex h-32 w-24 flex-col items-center justify-center rounded-lg bg-white shadow-md"
                    style={{ borderTop: `4px solid ${template.primaryColor}` }}
                >
                    <div
                        className="mb-2 h-8 w-8 rounded-full"
                        style={{ backgroundColor: template.primaryColor + "30" }}
                    />
                    <div className="space-y-1">
                        <div
                            className="h-1.5 w-16 rounded"
                            style={{ backgroundColor: template.primaryColor }}
                        />
                        <div className="h-1 w-12 rounded bg-gray-300" />
                        <div className="h-1 w-14 rounded bg-gray-300" />
                    </div>
                </div>

                {/* Selected checkmark */}
                {isSelected && (
                    <div className="absolute right-2 top-2 rounded-full bg-orange-500 p-1">
                        <Check className="h-4 w-4 text-white" />
                    </div>
                )}
            </div>

            <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{template.description}</p>
                <div className="mt-3 flex items-center gap-2">
                    <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: template.primaryColor }}
                    />
                    <span className="text-xs text-gray-400">{template.fontFamily}</span>
                </div>
            </CardContent>
        </Card>
    );
}
