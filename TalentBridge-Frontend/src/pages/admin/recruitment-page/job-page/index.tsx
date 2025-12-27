import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import { Plus } from "lucide-react";
import type { Job } from "@/types/job";
import { JobSearchSection } from "../../../commons/job-manager-components/JobSearchSection.tsx";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getErrorMessage } from "@/features/slices/auth/authThunk";
import { deleteJobById, findAllJobs, getJobStatsByLevel, type JobLevelStats } from "@/services/jobApi";
import Pagination from "@/components/custom/Pagination";

import { JobDetailsSidebar } from "../../../commons/job-manager-components/JobDetailsSidebar.tsx";
import { JobTable } from "../../../commons/job-manager-components/JobTable.tsx";
import HasPermission from "@/pages/commons/HasPermission.tsx";

const JobManagerPage = () => {
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
  const [searchCompanyName, setsearchCompanyName] = useState("");
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
    searchCompanyName: string,
    searchLevel: string,
    searchLocation: string,
  ) => {
    setIsLoading(true);
    try {
      const filters: string[] = [];

      if (searchName) filters.push(`name ~ '*${searchName}*'`);
      if (searchCompanyName)
        filters.push(`company.name ~ '*${searchCompanyName}*'`);
      if (searchLevel && searchLevel !== "all")
        filters.push(`level : '${searchLevel}'`);
      if (searchLocation) filters.push(`location ~ '*${searchLocation}*'`);

      const filter = filters.length > 0 ? filters.join(" and ") : null;

      const res = (await findAllJobs({ page, size, filter, sort: "createdAt,desc" })).data.data;
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
      searchCompanyName,
      searchLevel,
      searchLocation,
    );
  }, [
    currentPage,
    itemsPerPage,
    searchName,
    searchCompanyName,
    searchLevel,
    searchLocation,
  ]);

  // ============================
  // HANDLE RESET
  // ============================
  const handleReset = () => {
    setSearchName("");
    setsearchCompanyName("");
    setSearchLevel("all");
    setSearchLocation("");
    setIsExpandedSearch(false);

    fetchJobs(
      currentPage,
      itemsPerPage,
      searchName,
      searchCompanyName,
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
      await deleteJobById(id);
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
    navigate(`/admin/recruitment/job-manager/upsert?id=${id}`);
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
        const res = await getJobStatsByLevel();
        setLevelStats(res.data.data);
      } catch (err) {
        console.error("Failed to fetch job stats:", err);
      }
    };
    fetchStats();
  }, [jobs]); // Re-fetch khi jobs thay đổi

  return (
    <div className="space-y-6">
      <JobSearchSection
        searchName={searchName}
        searchCompanyName={searchCompanyName}
        searchLevel={searchLevel}
        searchLocation={searchLocation}
        isExpanded={isExpandedSearch}
        onReset={handleReset}
        onExpandToggle={() => setIsExpandedSearch(!isExpandedSearch)}
        onChange={{
          name: setSearchName,
          company: setsearchCompanyName,
          level: setSearchLevel,
          location: setSearchLocation,
        }}
      />

      {/* Thống kê trình độ - Modern Design */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {/* Intern */}
        <div className="group relative overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:shadow-md hover:ring-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 transition-transform duration-300 group-hover:scale-110">
              <svg className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Intern</p>
              <p className="text-2xl font-bold text-slate-800">{levelStats.INTERN}</p>
            </div>
          </div>
        </div>

        {/* Fresher */}
        <div className="group relative overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-emerald-100 transition-all duration-300 hover:shadow-md hover:ring-emerald-200">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 transition-transform duration-300 group-hover:scale-110">
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">Fresher</p>
              <p className="text-2xl font-bold text-emerald-700">{levelStats.FRESHER}</p>
            </div>
          </div>
        </div>

        {/* Middle */}
        <div className="group relative overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-blue-100 transition-all duration-300 hover:shadow-md hover:ring-blue-200">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 transition-transform duration-300 group-hover:scale-110">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-blue-600">Middle</p>
              <p className="text-2xl font-bold text-blue-700">{levelStats.MIDDLE}</p>
            </div>
          </div>
        </div>

        {/* Senior */}
        <div className="group relative overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-amber-100 transition-all duration-300 hover:shadow-md hover:ring-amber-200">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 transition-transform duration-300 group-hover:scale-110">
              <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-amber-600">Senior</p>
              <p className="text-2xl font-bold text-amber-700">{levelStats.SENIOR}</p>
            </div>
          </div>
        </div>

        {/* Leader */}
        <div className="group relative overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-purple-100 transition-all duration-300 hover:shadow-md hover:ring-purple-200">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 transition-transform duration-300 group-hover:scale-110">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-purple-600">Leader</p>
              <p className="text-2xl font-bold text-purple-700">{levelStats.LEADER}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Danh sách công việc</h2>
        <HasPermission perm={"POST /jobs"}>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate("/admin/recruitment/job-manager/upsert")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm mới
          </Button>
        </HasPermission>
      </div>

      <JobTable
        jobs={jobs}
        isLoading={isLoading}
        onEdit={handleOpenUpdatePage}
        onDelete={handleDelete}
        onView={(job) => handleOpenDetails(job)}
      />

      <Pagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        showItemsPerPageSelect={true}
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

export default JobManagerPage;
