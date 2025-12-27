import { RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";

interface JobSearchSectionProps {
  searchName: string;
  searchCompanyName?: string;
  searchLevel: string;
  searchLocation: string;
  isExpanded?: boolean; // Deprecated - kept for backward compatibility
  onReset: () => void;
  onExpandToggle?: () => void; // Deprecated - kept for backward compatibility
  onChange: {
    name: (val: string) => void;
    company?: (val: string) => void;
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
    <div className="bg-card rounded-lg border p-4">
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Tên công việc */}
        <div className="space-y-2">
          <Label htmlFor="search-title">Tên công việc:</Label>
          <Input
            id="search-title"
            placeholder="Nhập tên công việc..."
            value={searchName}
            onChange={(e) => onChange.name(e.target.value)}
          />
        </div>

        {/* Công ty (nếu có) */}
        {typeof onChange.company === "function" && (
          <div className="space-y-2">
            <Label htmlFor="search-company">Công ty:</Label>
            <Input
              id="search-company"
              placeholder="Tên công ty..."
              value={searchCompanyName ?? ""}
              onChange={(e) => onChange.company?.(e.target.value)}
            />
          </div>
        )}

        {/* Level */}
        <div className="space-y-2">
          <Label htmlFor="search-level">Level:</Label>
          <Select value={searchLevel} onValueChange={onChange.level}>
            <SelectTrigger>
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

        {/* Địa điểm */}
        <div className="space-y-2">
          <Label htmlFor="search-location">Địa điểm:</Label>
          <Input
            id="search-location"
            placeholder="Nhập địa điểm..."
            value={searchLocation}
            onChange={(e) => onChange.location(e.target.value)}
          />
        </div>

        {/* Nút Tải lại */}
        <div className="flex items-end">
          <Button variant="outline" onClick={onReset} className="w-full md:w-auto">
            <RotateCcw className="mr-2 h-4 w-4" />
            Tải lại
          </Button>
        </div>
      </div>
    </div>
  );
}
