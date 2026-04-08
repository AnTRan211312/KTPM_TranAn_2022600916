"use client";

import { RotateCcw } from "lucide-react";
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

interface JobSearchSectionProps {
  searchName: string;
  searchCompanyName: string;
  searchLevel: string;
  searchLocation: string;
  isExpanded?: boolean; // Không dùng nữa, giữ lại để tương thích
  onReset: () => void;
  onExpandToggle?: () => void; // Không dùng nữa, giữ lại để tương thích
  onChange: {
    name: (val: string) => void;
    company: (val: string) => void;
    level: (val: string) => void;
    location: (val: string) => void;
  };
}

export function JobSearchSection({
  searchName,
  searchCompanyName,
  searchLevel,
  searchLocation,
  onReset,
  onChange,
}: JobSearchSectionProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {/* Tất cả trên 1 dòng */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[150px] flex-1 space-y-2">
          <Label htmlFor="search-title" className="font-medium text-gray-700">
            Tên công việc:
          </Label>
          <Input
            id="search-title"
            placeholder="Nhập tên công việc..."
            value={searchName}
            onChange={(e) => onChange.name(e.target.value)}
            className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
          />
        </div>

        <div className="min-w-[150px] flex-1 space-y-2">
          <Label htmlFor="search-company" className="font-medium text-gray-700">
            Công ty:
          </Label>
          <Input
            id="search-company"
            placeholder="Tên công ty..."
            value={searchCompanyName}
            onChange={(e) => onChange.company(e.target.value)}
            className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
          />
        </div>

        <div className="min-w-[100px] space-y-2">
          <Label htmlFor="search-level" className="font-medium text-gray-700">
            Level:
          </Label>
          <Select value={searchLevel} onValueChange={onChange.level}>
            <SelectTrigger className="border-gray-300 focus:border-orange-500 focus:ring-orange-500">
              <SelectValue placeholder="Chọn level..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="INTERN">Intern</SelectItem>
              <SelectItem value="FRESHER">Fresher</SelectItem>
              <SelectItem value="MIDDLE">Middle</SelectItem>
              <SelectItem value="SENIOR">Senior</SelectItem>
              <SelectItem value="LEADER">Leader</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[150px] space-y-2">
          <Label
            htmlFor="search-location"
            className="font-medium text-gray-700"
          >
            Địa điểm:
          </Label>
          <Select value={searchLocation} onValueChange={onChange.location}>
            <SelectTrigger className="border-gray-300 focus:border-orange-500 focus:ring-orange-500">
              <SelectValue placeholder="Chọn địa điểm..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="Hà Nội">Hà Nội</SelectItem>
              <SelectItem value="Hồ Chí Minh">Hồ Chí Minh</SelectItem>
              <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
              <SelectItem value="Hải Phòng">Hải Phòng</SelectItem>
              <SelectItem value="Cần Thơ">Cần Thơ</SelectItem>
              <SelectItem value="Bình Dương">Bình Dương</SelectItem>
              <SelectItem value="Đồng Nai">Đồng Nai</SelectItem>
              <SelectItem value="Bắc Ninh">Bắc Ninh</SelectItem>
              <SelectItem value="Nghệ An">Nghệ An</SelectItem>
              <SelectItem value="Thừa Thiên Huế">Thừa Thiên Huế</SelectItem>
              <SelectItem value="Khánh Hòa">Khánh Hòa</SelectItem>
              <SelectItem value="Bà Rịa - Vũng Tàu">Bà Rịa - Vũng Tàu</SelectItem>
              <SelectItem value="Long An">Long An</SelectItem>
              <SelectItem value="Quảng Ninh">Quảng Ninh</SelectItem>
              <SelectItem value="Thanh Hóa">Thanh Hóa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Nút Tải lại cùng dòng */}
        <div className="flex-shrink-0">
          <Button
            variant="outline"
            onClick={onReset}
            className="border-orange-500 bg-transparent text-orange-600 hover:bg-orange-50 hover:text-orange-700"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Tải lại
          </Button>
        </div>
      </div>
    </div>
  );
}
