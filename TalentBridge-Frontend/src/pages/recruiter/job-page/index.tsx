import Pagination from "@/components/custom/Pagination";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/features/slices/auth/authThunk";
import { JobDetailsSidebar } from "@/pages/commons/job-manager-components/JobDetailsSidebar.tsx";
import { JobSearchSection } from "@/pages/commons/job-manager-components/JobSearchSection.tsx";
import { JobTable } from "@/pages/commons/job-manager-components/JobTable.tsx";
import {
  deleteJobByIdForRecruiterCompany,
  findAllJobsForRecruiterCompany,
  getJobStatsByLevelForRecruiterCompany,
  type JobLevelStats,
} from "@/services/jobApi";
import type { Job } from "@/types/job";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const JobManagerRecruiterPage = () => {
  const navigate = useNavigate();

  // ============================
  // Data
  // ============================
  const [jobs, setJobs] = useState<Job[]>([]);
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
  const [isExpandedSearch, setIsExpandedSearch] = useState(false);

  const [searchName, setSearchName] = useState("");
  const [searchLevel, setSearchLevel] = useState("all");
  const [searchLocation, setSearchLocation] = useState("");

  // ============================
  // View Details State
  // ============================
  const [hoveredJob, setHoveredJob] = useState<Job | null>(null);
  const [showDetailsSidebar, setShowDetailsSidebar] = useState(false);

  const handleOpenDetails = (job: Job) => {
    setHoveredJob(job);
    setShowDetailsSidebar(true);
  };

  const handleCloseDetails = () => {
    setHoveredJob(null);
    setShowDetailsSidebar(false);
  };

  // ============================
  // HANDLE FETCHING DATA
  // ============================
  const fetchJobs = async (
    page: number,
    size: number,
    searchName: string,
    searchLevel: string,
    searchLocation: string,
  ) => {
    setIsLoading(true);
    try {
      const filters: string[] = [];

      if (searchName) filters.push(`name ~ '*${searchName}*'`);
      if (searchLevel && searchLevel !== "all")
        filters.push(`level : '${searchLevel}'`);
      if (searchLocation) filters.push(`location ~ '*${searchLocation}*'`);

      const filter = filters.length > 0 ? filters.join(" and ") : null;

      const res = (await findAllJobsForRecruiterCompany({ page, size, filter, sort: "createdAt,desc" }))
        .data.data;
      setJobs(res.content);
      setTotalElements(res.totalElements);
      setTotalPages(res.totalPages);
    } catch (err) {
      toast.error(getErrorMessage(err, "Không thể lấy danh sách công ty"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(
      currentPage,
      itemsPerPage,
      searchName,
      searchLevel,
      searchLocation,
    );
  }, [currentPage, itemsPerPage, searchName, searchLevel, searchLocation]);

  // ============================
  // HANDLE RESET
  // ============================
  const handleReset = () => {
    setSearchName("");
    setSearchLevel("all");
    setSearchLocation("");
    setIsExpandedSearch(false);

    fetchJobs(
      currentPage,
      itemsPerPage,
      searchName,
      searchLevel,
      searchLocation,
    );
  };

  // ============================
  // HANDLE DELETE
  // ============================
  const handleDelete = async (id: number) => {
    setIsLoading(true);
    try {
      await deleteJobByIdForRecruiterCompany(id);
      toast.success("Xóa công ty thành công");

      if (hoveredJob?.id === id) handleCloseDetails();
      handleReset();
    } catch (err) {
      toast.error(getErrorMessage(err, "Xóa công ty thất bại"));
    } finally {
      setIsLoading(false);
    }
  };

  // ============================
  // HANDLE OPEN UPDATE page
  // ============================
  const handleOpenUpdatePage = async (id: number) => {
    navigate(`/recruiter/jobs/upsert?id=${id}`);
  };

  // Thống kê trình độ từ API
  const [levelStats, setLevelStats] = useState<JobLevelStats>({
    INTERN: 0,
    FRESHER: 0,
    MIDDLE: 0,
    SENIOR: 0,
    LEADER: 0,
  });

  // Fetch thống kê khi component mount hoặc sau khi jobs thay đổi
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getJobStatsByLevelForRecruiterCompany();
        setLevelStats(res.data.data);
      } catch (err) {
        console.error("Failed to fetch job stats:", err);
      }
    };
    fetchStats();
  }, [jobs]);

  return (
    <div className="space-y-6">
      <JobSearchSection
        searchName={searchName}
        searchLevel={searchLevel}
        searchLocation={searchLocation}
        isExpanded={isExpandedSearch}
        onReset={handleReset}
        onExpandToggle={() => setIsExpandedSearch(!isExpandedSearch)}
        onChange={{
          name: setSearchName,
          level: setSearchLevel,
          location: setSearchLocation,
        }}
      />

      {/* Thống kê trình độ */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Thống kê theo trình độ</h3>
          <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600">
            Tổng: {levelStats.INTERN + levelStats.FRESHER + levelStats.MIDDLE + levelStats.SENIOR + levelStats.LEADER} vị trí
          </span>
        </div>

        <div className="grid grid-cols-5 divide-x divide-gray-100">
          {/* Intern */}
          <div className="group cursor-pointer px-4 py-3 text-center transition-all hover:bg-gray-50">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-all group-hover:bg-gray-200 group-hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900">{levelStats.INTERN}</p>
            <p className="mt-1 text-sm font-medium text-gray-500">Intern</p>
          </div>

          {/* Fresher */}
          <div className="group cursor-pointer px-4 py-3 text-center transition-all hover:bg-emerald-50">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 transition-all group-hover:bg-emerald-200 group-hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900">{levelStats.FRESHER}</p>
            <p className="mt-1 text-sm font-medium text-emerald-600">Fresher</p>
          </div>

          {/* Middle */}
          <div className="group cursor-pointer px-4 py-3 text-center transition-all hover:bg-blue-50">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 transition-all group-hover:bg-blue-200 group-hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900">{levelStats.MIDDLE}</p>
            <p className="mt-1 text-sm font-medium text-blue-600">Middle</p>
          </div>

          {/* Senior */}
          <div className="group cursor-pointer px-4 py-3 text-center transition-all hover:bg-amber-50">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 transition-all group-hover:bg-amber-200 group-hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900">{levelStats.SENIOR}</p>
            <p className="mt-1 text-sm font-medium text-amber-600">Senior</p>
          </div>

          {/* Leader */}
          <div className="group cursor-pointer px-4 py-3 text-center transition-all hover:bg-purple-50">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 transition-all group-hover:bg-purple-200 group-hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900">{levelStats.LEADER}</p>
            <p className="mt-1 text-sm font-medium text-purple-600">Leader</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Danh sách công việc</h2>
        <Button
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => navigate("/recruiter/jobs/upsert")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm mới
        </Button>
      </div>

      <JobTable
        jobs={jobs}
        isLoading={isLoading}
        onEdit={handleOpenUpdatePage}
        onDelete={handleDelete}
        onView={(job) => handleOpenDetails(job)}
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

      {hoveredJob && (
        <JobDetailsSidebar
          job={hoveredJob}
          isOpen={showDetailsSidebar}
          onClose={handleCloseDetails}
          onEdit={(job) => handleOpenUpdatePage(job.id)}
          onDelete={(id) => handleDelete(id)}
        />
      )}
    </div>
  );
};

export default JobManagerRecruiterPage;
