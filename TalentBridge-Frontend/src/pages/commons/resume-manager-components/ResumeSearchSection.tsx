import { RotateCcw } from "lucide-react";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";

interface ResumeSearchSectionProps {
  onReset: () => void;
  searchJobName: string;
  setSearchJobName: (value: string) => void;
  searchCompanyName?: string;
  setSearchCompanyName?: (value: string) => void;
  isRecruiter?: boolean;
}

export const ResumeSearchSection = ({
  onReset,
  searchJobName,
  setSearchJobName,
  searchCompanyName,
  setSearchCompanyName,
  isRecruiter = false,
}: ResumeSearchSectionProps) => {
  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex flex-wrap items-end gap-4">
        {!isRecruiter && setSearchCompanyName && (
          <div className="min-w-[200px] flex-1 space-y-2">
            <Label htmlFor="search-company-name">Tên công ty:</Label>
            <Input
              id="search-company-name"
              placeholder="Nhập tên công ty..."
              value={searchCompanyName}
              onChange={(e) => setSearchCompanyName(e.target.value)}
            />
          </div>
        )}
        <div className="min-w-[200px] flex-1 space-y-2">
          <Label htmlFor="search-job-name">Tên công việc:</Label>
          <Input
            id="search-job-name"
            placeholder="Nhập tên công việc..."
            value={searchJobName}
            onChange={(e) => setSearchJobName(e.target.value)}
          />
        </div>
        <div className="flex-shrink-0">
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Tải lại
          </Button>
        </div>
      </div>
    </div>
  );
};
