import { Edit, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { EmptyState } from "@/components/custom/EmptyState.tsx";
import LoadingSpinner from "@/components/custom/LoadingSpinner.tsx";
import { formatISO } from "@/utils/convertHelper.ts";
import type { ResumeForDisplayResponseDto } from "@/types/resume";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { Badge } from "@/components/ui/badge.tsx";
import { getResumeStatusColor, getResumeStatusLabel, getResumeStatusIcon } from "@/utils/tagColorMapper.ts";


interface ResumeTableProps {
  resumes: ResumeForDisplayResponseDto[];
  isLoading: boolean;
  onViewResumePDF: (resume: ResumeForDisplayResponseDto) => void;
  theme?: "blue" | "purple";
}

export function ResumeTable({
  resumes,
  isLoading,
  onViewResumePDF,
  theme = "blue",
}: ResumeTableProps) {
  return (
    <div className={`overflow-auto rounded-lg border border-${theme}-600`} style={{ maxHeight: 'calc(100vh - 380px)' }}>
      <Table>
        <TableHeader
          className={`${theme === "blue" ? "bg-blue-600" : "bg-purple-600"} text-white`}
        >
          <TableRow>
            <TableHead className="text-center font-bold text-white">
              Logo
            </TableHead>
            <TableHead className="text-center font-bold text-white">
              Công ty
            </TableHead>
            <TableHead className="text-center font-bold text-white">
              Công việc
            </TableHead>
            <TableHead className="text-center font-bold text-white">
              Người nộp
            </TableHead>
            <TableHead className="text-center font-bold text-white">
              Ngày nộp
            </TableHead>
            <TableHead className="text-center font-bold text-white">
              Lần cập nhật gần nhất
            </TableHead>
            <TableHead className="text-center font-bold text-white">
              Trạng thái
            </TableHead>
            <TableHead className="text-center font-bold text-white">
              Hành động
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8}>
                <div className="flex justify-center py-6">
                  <LoadingSpinner />
                </div>
              </TableCell>
            </TableRow>
          ) : resumes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8}>
                <EmptyState
                  title="Không tìm thấy hồ sơ xin việc nào"
                  description="Chưa có ai nộp hồ sơ cả"
                  icon={
                    <Wrench className="text-muted-foreground mb-4 h-12 w-12" />
                  }
                />
              </TableCell>
            </TableRow>
          ) : (
            resumes.map((resume) => (
              <TableRow key={resume.id}>
                <TableCell className="text-center">
                  {resume.company.logoUrl && (
                    <img
                      src={resume.company.logoUrl}
                      alt={resume.company.name}
                      className="h-10 w-10 rounded-md border bg-white object-contain shadow-sm"
                    />
                  )}
                </TableCell>
                <TableCell className="max-w-[200px] text-center break-all whitespace-normal">
                  {resume.company.name}
                </TableCell>
                <TableCell className="max-w-[200px] text-center break-all whitespace-normal">
                  {resume.job.name}
                </TableCell>
                <TableCell className="text-center">
                  {resume.user.email}
                </TableCell>
                <TableCell className="text-center">
                  {formatISO(resume.createdAt)}
                </TableCell>
                <TableCell className="text-center">
                  {formatISO(resume.updatedAt)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={`${getResumeStatusColor(resume.status)} font-medium transition-colors duration-200`}>
                    <span className="mr-1.5 text-[10px]">{getResumeStatusIcon(resume.status)}</span>
                    {getResumeStatusLabel(resume.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-orange-500 hover:text-orange-600"
                            onClick={() => onViewResumePDF(resume)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Xem hồ sơ ứng viên</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
