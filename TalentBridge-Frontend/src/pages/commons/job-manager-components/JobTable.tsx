import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Edit, Briefcase } from "lucide-react";
import { DeleteConfirmDialog } from "@/components/custom/DeleteConfirmationDialog.tsx";
import { EmptyState } from "@/components/custom/EmptyState.tsx";
import { formatISO } from "@/utils/convertHelper.ts";
import type { Job } from "@/types/job";
import { levelColors } from "@/utils/tagColorMapper.ts";
import HasPermission from "@/pages/commons/HasPermission.tsx";

interface JobTableProps {
  jobs: Job[];
  isLoading: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onView: (job: Job) => void;
  theme?: string;
}

export function JobTable({
  jobs,
  isLoading,
  onEdit,
  onDelete,
  onView,
  theme = "blue",
}: JobTableProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { className: string; label: string; icon: string }> = {
      ACTIVE: {
        className: "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100",
        label: "Đang tuyển",
        icon: "●"
      },
      EXPIRED: {
        className: "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100",
        label: "Hết hạn",
        icon: "✕"
      },
      PAUSED: {
        className: "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100",
        label: "Tạm dừng",
        icon: "◐"
      },
      DRAFT: {
        className: "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100",
        label: "Nháp",
        icon: "◌"
      },
    };

    const config = statusConfig[status] || { className: "bg-gray-100 text-gray-600 border border-gray-200", label: status, icon: "○" };

    return (
      <Badge className={`${config.className} font-medium transition-colors duration-200`}>
        <span className="mr-1.5 text-[10px]">{config.icon}</span>
        {config.label}
      </Badge>
    );
  };

  return (
    <div
      className={`overflow-hidden overflow-x-auto rounded-lg border ${theme === "blue" ? "border-blue-600" : "border-purple-600"}`}
    >
      <Table>
        <TableHeader
          className={`text-white ${theme === "blue" ? "bg-blue-600" : "bg-purple-600"}`}
        >
          <TableRow>
            <TableHead className="text-center font-bold text-white">
              Tên Công việc
            </TableHead>
            <TableHead className="text-center font-bold text-white">
              Công ty
            </TableHead>
            <TableHead className="text-center font-bold text-white">
              Trình độ
            </TableHead>
            <TableHead className="text-center font-bold text-white">
              Trạng thái
            </TableHead>
            <TableHead className="text-center font-bold text-white">
              Ngày tạo
            </TableHead>
            <TableHead className="text-center font-bold text-white">
              Ngày kết thúc
            </TableHead>
            <TableHead className="text-center font-bold text-white">
              Hành động
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={7}>
                <div className="flex items-center justify-center py-8">
                  <div
                    className={`h-8 w-8 animate-spin rounded-full border-b-2 ${theme === "blue" ? "border-blue-600" : "border-purple-600"}`}
                  ></div>
                </div>
              </TableCell>
            </TableRow>
          )}

          {!isLoading && jobs.length === 0 && (
            <TableRow>
              <TableCell colSpan={7}>
                <EmptyState
                  title="Không tìm thấy công việc nào"
                  description="Thử thay đổi tiêu chí tìm kiếm hoặc thêm công việc mới"
                  icon={
                    <Briefcase className="text-muted-foreground h-12 w-12" />
                  }
                />
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            jobs.map((job) => (
              <TableRow
                key={job.id}
                onClick={() => onView(job)}
                className="cursor-pointer transition-colors duration-200"
              >
                <TableCell className="text-center text-sm">
                  {job.name}
                </TableCell>
                <TableCell className="text-center text-sm">
                  {job.company.name}
                </TableCell>
                <TableCell className="text-center text-sm">
                  <Badge className={levelColors[job.level]}>{job.level}</Badge>
                </TableCell>
                <TableCell className="text-center text-sm">
                  {getStatusBadge(job.status)}
                </TableCell>
                <TableCell className="text-center text-sm">
                  {formatISO(job.startDate)}
                </TableCell>
                <TableCell className="text-center text-sm">
                  {formatISO(job.endDate)}
                </TableCell>
                <TableCell>
                  <div
                    className="flex items-center justify-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <HasPermission
                      perm={["PUT /jobs/{id}", "PUT /jobs/company/{id}"]}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(job.id)}
                      >
                        <Edit className="h-4 w-4 text-orange-500" />
                      </Button>
                    </HasPermission>

                    <HasPermission
                      perm={["DELETE /jobs/{id}", "DELETE /jobs/company/{id}"]}
                    >
                      <DeleteConfirmDialog
                        onConfirm={() => onDelete(job.id)}
                        title="Bạn có chắc muốn xóa công việc này?"
                        styledDescription={
                          <p>
                            Hành động này sẽ
                            <span className="text-red-500">
                              {" "}
                              xóa CÔNG VIỆC và HỒ SƠ ỨNG VIÊN
                            </span>{" "}
                            đã nộp cho công việc này.
                          </p>
                        }
                      />
                    </HasPermission>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
