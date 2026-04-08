import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { CVSkill } from "@/types/cv";

interface SkillsFormProps {
    data: CVSkill[];
    onChange: (data: CVSkill[]) => void;
}

const SKILL_LEVELS = [
    { value: "Beginner", label: "Mới bắt đầu" },
    { value: "Intermediate", label: "Trung bình" },
    { value: "Advanced", label: "Nâng cao" },
    { value: "Expert", label: "Chuyên gia" },
];

const SKILL_CATEGORIES = [
    "Programming",
    "Frameworks",
    "Databases",
    "Tools",
    "Soft Skills",
    "Languages",
    "Other",
];

export function SkillsForm({ data, onChange }: SkillsFormProps) {
    const addSkill = () => {
        const newSkill: CVSkill = {
            id: crypto.randomUUID(),
            name: "",
            level: "Intermediate",
            category: "",
        };
        onChange([...data, newSkill]);
    };

    const updateSkill = (id: string, field: keyof CVSkill, value: any) => {
        onChange(
            data.map((skill) =>
                skill.id === id ? { ...skill, [field]: value } : skill
            )
        );
    };

    const removeSkill = (id: string) => {
        onChange(data.filter((skill) => skill.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Kỹ năng & Chuyên môn
                    </h3>
                    <p className="text-sm text-gray-500">Thể hiện năng lực cốt lõi của bạn</p>
                </div>
                <Button onClick={addSkill} size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-sm transition-all active:scale-95 gap-1">
                    <Plus className="h-4 w-4" />
                    Thêm mới
                </Button>
            </div>

            {data.length === 0 ? (
                <div
                    className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/30 cursor-pointer hover:bg-gray-50/80 transition-colors"
                    onClick={addSkill}
                >
                    <div className="bg-white p-3 rounded-2xl shadow-sm border mb-4">
                        <Plus className="h-6 w-6 text-blue-500" />
                    </div>
                    <p className="text-gray-500 font-medium">Chưa có kỹ năng nào được thêm</p>
                    <p className="text-xs text-gray-400 mt-1">Nhấp để bắt đầu xây dựng hồ sơ của bạn</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {data.map((skill, index) => (
                        <div
                            key={skill.id}
                            className="group relative flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5 transition-all duration-300"
                        >
                            {/* Index circle */}
                            <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 text-xs font-bold group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                {index + 1}
                            </div>

                            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                                <div className="md:col-span-2">
                                    <Label className="text-[10px] uppercase tracking-wider text-gray-400 mb-1 ml-1 block font-bold">Tên kỹ năng</Label>
                                    <Input
                                        className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all"
                                        value={skill.name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            updateSkill(skill.id, "name", e.target.value)
                                        }
                                        placeholder="VD: React, Python, UI Design..."
                                    />
                                </div>

                                <div>
                                    <Label className="text-[10px] uppercase tracking-wider text-gray-400 mb-1 ml-1 block font-bold">Mức độ</Label>
                                    <Select
                                        value={skill.level}
                                        onValueChange={(value) =>
                                            updateSkill(skill.id, "level", value)
                                        }
                                    >
                                        <SelectTrigger className="h-10 border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white transition-all">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SKILL_LEVELS.map((level) => (
                                                <SelectItem key={level.value} value={level.value}>
                                                    {level.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-[10px] uppercase tracking-wider text-gray-400 mb-1 ml-1 block font-bold">Bộ phận</Label>
                                    <Select
                                        value={skill.category || ""}
                                        onValueChange={(value) =>
                                            updateSkill(skill.id, "category", value)
                                        }
                                    >
                                        <SelectTrigger className="h-10 border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white transition-all">
                                            <SelectValue placeholder="Chọn..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SKILL_CATEGORIES.map((cat) => (
                                                <SelectItem key={cat} value={cat}>
                                                    {cat}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSkill(skill.id)}
                                className="h-10 w-10 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors ml-auto md:relative"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick add popular skills */}
            <div className="mt-8 p-6 rounded-3xl bg-blue-50/50 border border-blue-100/50">
                <div className="flex items-center gap-2 mb-4">
                    <Plus className="h-4 w-4 text-blue-500" />
                    <Label className="text-sm font-bold text-blue-900">
                        Thêm nhanh kỹ năng phổ biến
                    </Label>
                </div>
                <div className="flex flex-wrap gap-2">
                    {["JavaScript", "React", "Node.js", "Python", "Java", "SQL", "Git", "Docker", "UI/UX", "AWS"].map(
                        (skillName) => {
                            const isAdded = data.some((s) => s.name === skillName);
                            return (
                                <button
                                    key={skillName}
                                    onClick={() => {
                                        if (!isAdded) {
                                            onChange([
                                                ...data,
                                                {
                                                    id: crypto.randomUUID(),
                                                    name: skillName,
                                                    level: "Intermediate",
                                                    category: "Programming",
                                                },
                                            ]);
                                        }
                                    }}
                                    disabled={isAdded}
                                    className={`
                                        px-4 py-1.5 rounded-full text-xs font-semibold transition-all
                                        ${isAdded
                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed border-none"
                                            : "bg-white text-blue-600 hover:text-white hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20 border border-blue-200 flex items-center gap-1 active:scale-95"
                                        }
                                    `}
                                >
                                    {!isAdded && <Plus className="h-3 w-3" />}
                                    {skillName}
                                </button>
                            );
                        }
                    )}
                </div>
            </div>
        </div>
    );
}
