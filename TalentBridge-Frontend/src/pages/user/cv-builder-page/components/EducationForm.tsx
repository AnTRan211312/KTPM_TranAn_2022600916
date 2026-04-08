import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import type { CVEducation } from "@/types/cv";

interface EducationFormProps {
    data: CVEducation[];
    onChange: (data: CVEducation[]) => void;
}

export function EducationForm({ data, onChange }: EducationFormProps) {
    const addEducation = () => {
        const newEducation: CVEducation = {
            id: crypto.randomUUID(),
            school: "",
            degree: "",
            field: "",
            startDate: "",
            endDate: "",
            current: false,
            description: "",
        };
        onChange([...data, newEducation]);
    };

    const updateEducation = (
        id: string,
        field: keyof CVEducation,
        value: any
    ) => {
        onChange(
            data.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu))
        );
    };

    const removeEducation = (id: string) => {
        onChange(data.filter((edu) => edu.id !== id));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Học vấn</h3>
                <Button onClick={addEducation} size="sm" variant="outline" className="gap-1">
                    <Plus className="h-4 w-4" />
                    Thêm
                </Button>
            </div>

            {data.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center py-8">
                        <p className="text-sm text-gray-500">Chưa có thông tin học vấn</p>
                        <Button onClick={addEducation} className="mt-4 gap-1" variant="outline">
                            <Plus className="h-4 w-4" />
                            Thêm học vấn
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {data.map((edu) => (
                        <Card key={edu.id} className="relative">
                            <CardContent className="pt-6">
                                <div className="absolute right-2 top-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeEducation(edu.id)}
                                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Trường *</Label>
                                        <Input
                                            value={edu.school}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                updateEducation(edu.id, "school", e.target.value)
                                            }
                                            placeholder="Đại học Bách Khoa TP.HCM"
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Bằng cấp</Label>
                                            <Input
                                                value={edu.degree}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                    updateEducation(edu.id, "degree", e.target.value)
                                                }
                                                placeholder="Cử nhân / Kỹ sư"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Chuyên ngành</Label>
                                            <Input
                                                value={edu.field}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                    updateEducation(edu.id, "field", e.target.value)
                                                }
                                                placeholder="Công nghệ thông tin"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Năm bắt đầu</Label>
                                            <Input
                                                type="month"
                                                value={edu.startDate}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                    updateEducation(edu.id, "startDate", e.target.value)
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Năm tốt nghiệp</Label>
                                            <Input
                                                type="month"
                                                value={edu.endDate || ""}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                    updateEducation(edu.id, "endDate", e.target.value)
                                                }
                                                disabled={edu.current}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={edu.current}
                                            onCheckedChange={(checked) =>
                                                updateEducation(edu.id, "current", checked)
                                            }
                                        />
                                        <Label className="cursor-pointer">Đang học</Label>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Mô tả (tùy chọn)</Label>
                                        <Textarea
                                            value={edu.description || ""}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                                updateEducation(edu.id, "description", e.target.value)
                                            }
                                            placeholder="Thành tích, hoạt động nổi bật..."
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
