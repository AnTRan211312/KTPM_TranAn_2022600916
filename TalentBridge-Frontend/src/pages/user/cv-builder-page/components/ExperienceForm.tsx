import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import type { CVExperience } from "@/types/cv";

interface ExperienceFormProps {
    data: CVExperience[];
    onChange: (data: CVExperience[]) => void;
}

export function ExperienceForm({ data, onChange }: ExperienceFormProps) {
    const addExperience = () => {
        const newExperience: CVExperience = {
            id: crypto.randomUUID(),
            company: "",
            position: "",
            location: "",
            startDate: "",
            endDate: "",
            current: false,
            description: "",
            highlights: [],
        };
        onChange([...data, newExperience]);
    };

    const updateExperience = (
        id: string,
        field: keyof CVExperience,
        value: any
    ) => {
        onChange(
            data.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
        );
    };

    const removeExperience = (id: string) => {
        onChange(data.filter((exp) => exp.id !== id));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Kinh nghiệm làm việc</h3>
                <Button onClick={addExperience} size="sm" variant="outline" className="gap-1">
                    <Plus className="h-4 w-4" />
                    Thêm
                </Button>
            </div>

            {data.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center py-8">
                        <p className="text-sm text-gray-500">Chưa có kinh nghiệm nào</p>
                        <Button onClick={addExperience} className="mt-4 gap-1" variant="outline">
                            <Plus className="h-4 w-4" />
                            Thêm kinh nghiệm đầu tiên
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {data.map((exp) => (
                        <Card key={exp.id} className="relative">
                            <CardContent className="pt-6">
                                <div className="absolute right-2 top-2 flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeExperience(exp.id)}
                                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Công ty *</Label>
                                            <Input
                                                value={exp.company}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                    updateExperience(exp.id, "company", e.target.value)
                                                }
                                                placeholder="Tên công ty"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Vị trí *</Label>
                                            <Input
                                                value={exp.position}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                    updateExperience(exp.id, "position", e.target.value)
                                                }
                                                placeholder="Software Engineer"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Địa điểm</Label>
                                        <Input
                                            value={exp.location}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                updateExperience(exp.id, "location", e.target.value)
                                            }
                                            placeholder="TP. Hồ Chí Minh"
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Ngày bắt đầu</Label>
                                            <Input
                                                type="month"
                                                value={exp.startDate}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                    updateExperience(exp.id, "startDate", e.target.value)
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Ngày kết thúc</Label>
                                            <Input
                                                type="month"
                                                value={exp.endDate || ""}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                    updateExperience(exp.id, "endDate", e.target.value)
                                                }
                                                disabled={exp.current}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={exp.current}
                                            onCheckedChange={(checked) =>
                                                updateExperience(exp.id, "current", checked)
                                            }
                                        />
                                        <Label className="cursor-pointer">Đang làm việc tại đây</Label>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Mô tả công việc</Label>
                                        <Textarea
                                            value={exp.description}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                                updateExperience(exp.id, "description", e.target.value)
                                            }
                                            placeholder="Mô tả trách nhiệm và thành tựu..."
                                            rows={4}
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
