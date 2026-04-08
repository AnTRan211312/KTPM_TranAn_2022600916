import { useState, useEffect } from "react";
import type { DefaultCompanyResponseDto } from "@/types/company.d.ts";
import { toast } from "sonner";
import { getErrorMessage } from "@/features/slices/auth/authThunk";
import { findAllCompaniesWithJobsCount } from "@/services/companyApi";
import Pagination from "@/components/custom/Pagination";
import CompanyGrid from "./CompanyGrid";
import { CompanySearchSection } from "./CompanySearchSection";

export default function CompanyClientPage() {
  // Data
  const [companies, setCompanies] = useState<DefaultCompanyResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Search
  const [searchName, setSearchName] = useState("");
  const [searchAddress, setSearchAddress] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ============================
  // HANDLE FETCHING DATA
  // ============================
  const fetchCompanies = async (
    page: number,
    size: number,
    searchName: string,
    searchAddress: string,
  ) => {
    setIsLoading(true);

    try {
      const filters: string[] = [];

      if (searchName) filters.push(`name ~ '*${searchName}*'`);
      if (searchAddress) filters.push(`address ~ '*${searchAddress}*'`);

      const filter = filters.length > 0 ? filters.join(" and ") : null;

      const res = (await findAllCompaniesWithJobsCount({ page, size, filter }))
        .data.data;
      setCompanies(res.content);
      setTotalElements(res.totalElements);
      setTotalPages(res.totalPages);
    } catch (err) {
      toast.error(getErrorMessage(err, "Không thể lấy danh sách công ty."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(1, itemsPerPage, searchName, searchAddress);
    setCurrentPage(1);
  }, [searchName, searchAddress, itemsPerPage]);

  useEffect(() => {
    fetchCompanies(currentPage, itemsPerPage, searchName, searchAddress);
  }, [currentPage, itemsPerPage, searchName, searchAddress]);

  // ============================
  // HANDLE RESET
  // ============================
  const handleReset = async () => {
    setSearchName("");
    setSearchAddress("");
    setCurrentPage(1);

    await fetchCompanies(1, itemsPerPage, "", "");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-4/5 pt-8">
        {/* Feature Tips */}
        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-green-200 bg-green-50 p-3">
            <h3 className="mb-1 text-sm font-bold text-green-800">
              🏢 Khám phá công ty
            </h3>
            <p className="text-xs text-green-600">
              Tìm hiểu văn hóa công ty, đánh giá từ nhân viên và xem danh sách
              việc làm đang tuyển dụng
            </p>
          </div>
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
            <h3 className="mb-1 text-sm font-bold text-orange-800">
              💼 Cơ hội việc làm
            </h3>
            <p className="text-xs text-orange-600">
              Mỗi công ty có nhiều vị trí đang tuyển - click vào để xem chi tiết
              và ứng tuyển ngay
            </p>
          </div>
        </div>

        <div className="my-6">
          <CompanySearchSection
            searchName={searchName}
            setSearchName={setSearchName}
            searchAddress={searchAddress}
            setSearchAddress={setSearchAddress}
            onReset={handleReset}
          />
          <div className="mt-4 text-center text-sm text-gray-500">
            Tìm thấy {companies.length} công ty
          </div>
        </div>

        <CompanyGrid isLoading={isLoading} companies={companies} />

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
