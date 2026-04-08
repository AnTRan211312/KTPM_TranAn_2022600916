"use client";

import { useState, useEffect } from "react";
import { Flame, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { findAllSkills } from "@/services/skillApi";
import type { DefaultSkillResponseDto } from "@/types/skill.d.ts";
import { Skeleton } from "@/components/ui/skeleton";

interface SkillsFilterProps {
    selectedSkills: string[];
    onSkillsChange: (skills: string[]) => void;
}

const INITIAL_SKILLS_COUNT = 10;

export function SkillsFilter({
    selectedSkills,
    onSkillsChange,
}: SkillsFilterProps) {
    const [skills, setSkills] = useState<DefaultSkillResponseDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const response = await findAllSkills({ page: 0, size: 30 });
                setSkills(response.data.data.content);
            } catch (error) {
                console.error("Failed to fetch skills:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSkills();
    }, []);

    const handleSkillClick = (skillName: string) => {
        if (selectedSkills.includes(skillName)) {
            // Bỏ chọn skill
            onSkillsChange(selectedSkills.filter((s) => s !== skillName));
        } else {
            // Thêm skill
            onSkillsChange([...selectedSkills, skillName]);
        }
    };

    const handleClearAll = () => {
        onSkillsChange([]);
    };

    // Skills hiển thị (10 đầu tiên hoặc tất cả nếu expanded)
    const displayedSkills = isExpanded
        ? skills
        : skills.slice(0, INITIAL_SKILLS_COUNT);

    const hasMoreSkills = skills.length > INITIAL_SKILLS_COUNT;

    if (isLoading) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-32" />
                </div>
                <div className="flex flex-wrap gap-2">
                    {[...Array(8)].map((_, i) => (
                        <Skeleton key={i} className="h-8 w-24 rounded-full" />
                    ))}
                </div>
            </div>
        );
    }

    if (skills.length === 0) {
        return null;
    }

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <span className="font-semibold text-gray-800">Lọc theo kỹ năng</span>
                    {selectedSkills.length > 0 && (
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600">
                            {selectedSkills.length} đã chọn
                        </span>
                    )}
                </div>
                {selectedSkills.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearAll}
                        className="h-7 gap-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-3 w-3" />
                        Xóa tất cả
                    </Button>
                )}
            </div>

            {/* Skills List */}
            <div className="flex flex-wrap gap-2">
                {displayedSkills.map((skill) => {
                    const isSelected = selectedSkills.includes(skill.name);
                    return (
                        <button
                            key={skill.id}
                            onClick={() => handleSkillClick(skill.name)}
                            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200 ${isSelected
                                    ? "border-orange-500 bg-orange-500 text-white shadow-md"
                                    : "border-gray-200 bg-gray-50 text-gray-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                                }`}
                        >
                            {skill.name}
                        </button>
                    );
                })}

                {/* Xem thêm / Thu gọn button */}
                {hasMoreSkills && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-1 rounded-full border border-dashed border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-500 transition-all hover:border-gray-400 hover:text-gray-700"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp className="h-4 w-4" />
                                Thu gọn
                            </>
                        ) : (
                            <>
                                <ChevronDown className="h-4 w-4" />
                                +{skills.length - INITIAL_SKILLS_COUNT} kỹ năng
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Selected skills indicator */}
            {selectedSkills.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                    <span>Đang lọc:</span>
                    {selectedSkills.map((skill) => (
                        <span
                            key={skill}
                            className="inline-flex items-center gap-1 rounded-md bg-orange-100 px-2 py-0.5 font-medium text-orange-700"
                        >
                            {skill}
                            <button
                                onClick={() => handleSkillClick(skill)}
                                className="ml-0.5 rounded-full p-0.5 hover:bg-orange-200"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
