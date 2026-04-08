import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import type { Job } from "@/types/job";
import JobGrid from "./JobGrid";
import { JobSearchSection } from "./JobSearchSection";
import { SkillsFilter } from "./SkillsFilter";
import { getErrorMessage } from "@/features/slices/auth/authThunk";
import { findAllJobs } from "@/services/jobApi";
import { toast } from "sonner";
import Pagination from "@/components/custom/Pagination";

export default function JobClientPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ============================
  // Data
  // ============================
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ============================
  // Pagination State
  // ============================
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ============================
  // Search State
  // ============================
  const [searchName, setSearchName] = useState(searchParams.get("name") || "");
  const [searchCompanyName, setsearchCompanyName] = useState("");
  const [searchLevel, setSearchLevel] = useState("all");
  const [searchLocation, setSearchLocation] = useState(searchParams.get("location") || "");

  // Multi-select skills
  const [selectedSkills, setSelectedSkills] = useState<string[]>(() => {
    const skillsParam = searchParams.get("skills");
    return skillsParam ? skillsParam.split(",") : [];
  });

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
    skills: string[],
  ) => {
    setIsLoading(true);
    try {
      const filters: string[] = [];

      if (searchName) filters.push(`name ~ '*${searchName}*'`);
      if (searchCompanyName)
        filters.push(`company.name ~ '*${searchCompanyName}*'`);
      if (searchLevel && searchLevel !== "all")
        filters.push(`level : '${searchLevel}'`);
      if (searchLocation && searchLocation !== "all")
        filters.push(`location ~ '*${searchLocation}*'`);

      // Multi-skill filter: skills.name : 'React' or skills.name : 'Java'
      if (skills.length > 0) {
        const skillFilters = skills.map(s => `skills.name : '${s}'`).join(" or ");
        filters.push(`(${skillFilters})`);
      }

      const filter = filters.length > 0 ? filters.join(" and ") : null;

      const res = (await findAllJobs({ page, size, filter })).data.data;
      setJobs(res.content);
      setTotalElements(res.totalElements);
      setTotalPages(res.totalPages);
    } catch (err) {
      toast.error(getErrorMessage(err, "Không thể lấy danh sách công việc"));
    } finally {
      setIsLoading(false);
    }
  };

  // Đọc query params từ URL khi component mount hoặc URL thay đổi
  useEffect(() => {
    const nameParam = searchParams.get("name");
    const locationParam = searchParams.get("location");
    const skillsParam = searchParams.get("skills");

    if (nameParam !== null) {
      setSearchName(nameParam);
    }
    if (locationParam !== null) {
      setSearchLocation(locationParam);
    }
    if (skillsParam !== null) {
      setSelectedSkills(skillsParam.split(",").filter(Boolean));
    } else {
      setSelectedSkills([]);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchJobs(
      currentPage,
      itemsPerPage,
      searchName,
      searchCompanyName,
      searchLevel,
      searchLocation,
      selectedSkills,
    );
  }, [
    currentPage,
    itemsPerPage,
    searchName,
    searchCompanyName,
    searchLevel,
    searchLocation,
    selectedSkills,
  ]);

  // ============================
  // Update URL params when search changes
  // ============================
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchName) params.set("name", searchName);
    if (searchLocation && searchLocation !== "all") params.set("location", searchLocation);
    if (selectedSkills.length > 0) params.set("skills", selectedSkills.join(","));
    setSearchParams(params);
  }, [searchName, searchLocation, selectedSkills, setSearchParams]);

  // ============================
  // HANDLE SKILLS CHANGE
  // ============================
  const handleSkillsChange = (skills: string[]) => {
    setSelectedSkills(skills);
    setCurrentPage(1); // Reset về trang 1 khi filter thay đổi
  };

  // ============================
  // HANDLE RESET
  // ============================
  const handleReset = () => {
    setSearchName("");
    setsearchCompanyName("");
    setSearchLevel("all");
    setSearchLocation("");
    setSelectedSkills([]);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-4/5 pt-8">
        {/* Feature Tips */}
        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
            <h3 className="mb-1 text-sm font-bold text-purple-800">
              🤖 AI Phân tích CV
            </h3>
            <p className="text-xs text-purple-600">
              Ứng tuyển công việc → Nộp CV → AI tự động đánh giá điểm mạnh/yếu
              và gợi ý cải thiện CV của bạn
            </p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <h3 className="mb-1 text-sm font-bold text-blue-800">
              👑 Dành cho Nhà Tuyển Dụng
            </h3>
            <p className="text-xs text-blue-600">
              Đăng tin tuyển dụng → Xem số lượng ứng viên và bộ lọc CV nâng cao
              (Miễn phí)
            </p>
          </div>
        </div>

        {/* Skills Filter Section */}
        <div className="mb-4">
          <SkillsFilter
            selectedSkills={selectedSkills}
            onSkillsChange={handleSkillsChange}
          />
        </div>

        {/* Search Section */}
        <div className="my-6">
          <JobSearchSection
            searchName={searchName}
            searchCompanyName={searchCompanyName}
            searchLevel={searchLevel}
            searchLocation={searchLocation}
            onReset={handleReset}
            onChange={{
              name: setSearchName,
              company: setsearchCompanyName,
              level: setSearchLevel,
              location: setSearchLocation,
            }}
          />
          <div className="mt-4 text-center text-sm text-gray-500">
            Tìm thấy {totalElements} việc làm
            {selectedSkills.length > 0 && (
              <span className="ml-1 font-medium text-orange-600">
                với {selectedSkills.length} kỹ năng đã chọn
              </span>
            )}
          </div>
        </div>

        <JobGrid isLoading={isLoading} jobs={jobs} />

        <div className="my-12">
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            showItemsPerPageSelect={false}
          />
        </div>
      </div>
    </div>
  );
}
