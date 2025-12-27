import type {
  ResumeForDisplayResponseDto,
  UpdateResumeStatusRequestDto,
} from "@/types/resume";
import { useEffect, useState } from "react";
import { ResumeSearchSection } from "../../commons/resume-manager-components/ResumeSearchSection.tsx";
import Pagination from "@/components/custom/Pagination";
import {
  findAllResumesForRecruiterCompany,
  updateResumeStatusForRecruiterCompany,
  getResumeStatsByStatusForRecruiterCompany,
  type ResumeStatusStats,
} from "@/services/resumeApi";
import { getErrorMessage } from "@/features/slices/auth/authThunk";
import { toast } from "sonner";
import { ResumeTable } from "../../commons/resume-manager-components/ResumeTable.tsx";
import { ViewResumeDialog } from "../../commons/resume-manager-components/ViewResumeDialog.tsx";

const ResumeManagerRecruiterPage = () => {
  // ============================
  // Data
  // ============================
  const [resumes, setResumes] = useState<ResumeForDisplayResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ============================
  // Pagination State
  // ============================
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ============================
  // Search State
  // ============================
  const [searchJobName, setSearchJobName] = useState("");

  // ============================
  // Dialog State
  // ============================
  const [isDialogOpen, setisDialogOpen] = useState(false);
  const [selectedResume, setSelectedResume] =
    useState<ResumeForDisplayResponseDto | null>(null);

  const handleViewResumeDialog = (resume: ResumeForDisplayResponseDto) => {
    setSelectedResume(resume);
    setisDialogOpen(true);
  };

  // ============================
  // HANDLE FETCHING DATA
  // ============================
  const fetchResumes = async (
    page: number,
    size: number,
    searchJobName: string,
  ) => {
    setIsLoading(true);
    try {
      const filters: string[] = [];

      if (searchJobName) filters.push(`job.name ~ '*${searchJobName}*'`);

      const filter = filters.length > 0 ? filters.join(" and ") : null;

      const res = (
        await findAllResumesForRecruiterCompany({ page, size, filter, sort: "createdAt,desc" })
      ).data.data;
      setResumes(res.content);
      setTotalElements(res.totalElements);
      setTotalPages(res.totalPages);
    } catch (err) {
      toast.error(getErrorMessage(err, "Không thể lấy danh sách công ty"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes(currentPage, itemsPerPage, searchJobName);
  }, [currentPage, itemsPerPage, searchJobName]);

  useEffect(() => {
    fetchResumes(1, itemsPerPage, searchJobName);
    setCurrentPage(1);
  }, [itemsPerPage, searchJobName]);

  // ============================
  // HANDLE UPDATE RESUME STATUS
  // ============================
  const handleUpdateResumeStatus = async (
    resume: UpdateResumeStatusRequestDto,
  ) => {
    try {
      await updateResumeStatusForRecruiterCompany(resume);
      // Update local state instead of refetching all data
      setResumes((prevResumes) =>
        prevResumes.map((r) =>
          r.id === resume.id ? { ...r, status: resume.status } : r
        )
      );
      toast.success("Cập nhật trạng thái hồ sơ thành công");
    } catch (err) {
      toast.error(getErrorMessage(err, "Cập nhật trạng thái hồ sơ thất bại"));
    }
  };

  // ============================
  // HANDLE RESET
  // ============================
  const handleReset = () => {
    setSearchJobName("");
    setCurrentPage(1);
  };

  // Thống kê trạng thái từ API
  const [statusStats, setStatusStats] = useState<ResumeStatusStats>({
    PENDING: 0,
    REVIEWING: 0,
    APPROVED: 0,
    REJECTED: 0,
  });

  // Fetch thống kê khi component mount hoặc sau khi cập nhật
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getResumeStatsByStatusForRecruiterCompany();
        setStatusStats(res.data.data);
      } catch (err) {
        console.error("Failed to fetch resume stats:", err);
      }
    };
    fetchStats();
  }, [resumes]);

  return (
    <div className="space-y-6">
      <ResumeSearchSection
        onReset={handleReset}
        searchJobName={searchJobName}
        setSearchJobName={setSearchJobName}
        isRecruiter={true}
      />

      {/* Thống kê trạng thái - Modern Design */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {/* Chờ xử lý */}
        <div className="group relative overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-amber-100 transition-all duration-300 hover:shadow-md hover:ring-amber-200">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 transition-transform duration-300 group-hover:scale-110">
              <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-amber-600">Chờ xử lý</p>
              <p className="text-2xl font-bold text-amber-700">{statusStats.PENDING}</p>
            </div>
          </div>
        </div>

        {/* Đang xem xét */}
        <div className="group relative overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-blue-100 transition-all duration-300 hover:shadow-md hover:ring-blue-200">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 transition-transform duration-300 group-hover:scale-110">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-blue-600">Đang xem xét</p>
              <p className="text-2xl font-bold text-blue-700">{statusStats.REVIEWING}</p>
            </div>
          </div>
        </div>

        {/* Đã duyệt */}
        <div className="group relative overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-emerald-100 transition-all duration-300 hover:shadow-md hover:ring-emerald-200">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 transition-transform duration-300 group-hover:scale-110">
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">Đã duyệt</p>
              <p className="text-2xl font-bold text-emerald-700">{statusStats.APPROVED}</p>
            </div>
          </div>
        </div>

        {/* Từ chối */}
        <div className="group relative overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:shadow-md hover:ring-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 transition-transform duration-300 group-hover:scale-110">
              <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Từ chối</p>
              <p className="text-2xl font-bold text-gray-600">{statusStats.REJECTED}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <h2 className="text-lg font-semibold">Danh sách hồ sơ xin việc</h2>

      <ResumeTable
        resumes={resumes}
        isLoading={isLoading}
        onViewResumePDF={handleViewResumeDialog}
        theme={"purple"}
      />

      <Pagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        showItemsPerPageSelect={true}
        theme={"purple"}
      />

      <ViewResumeDialog
        open={isDialogOpen}
        onOpenChange={setisDialogOpen}
        onUpdate={handleUpdateResumeStatus}
        resume={selectedResume ?? ({} as ResumeForDisplayResponseDto)}
        onCloseForm={() => setSelectedResume(null)}
        theme={"purple"}
      />
    </div>
  );
};

export default ResumeManagerRecruiterPage;
