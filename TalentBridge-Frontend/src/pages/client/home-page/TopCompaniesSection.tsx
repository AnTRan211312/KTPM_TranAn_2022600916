import { EmptyState } from "@/components/custom/EmptyState";
import LoadingSpinner from "@/components/custom/LoadingSpinner";
import { getErrorMessage } from "@/features/slices/auth/authThunk";
import { findAllCompanies } from "@/services/companyApi";
import type { DefaultCompanyResponseDto } from "@/types/company.d.ts";
import { Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const TopCompaniesSection = () => {
  const [companies, setCompanies] = useState<DefaultCompanyResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const res = (await findAllCompanies({ page: 0, size: 5, filter: null }))
        .data.data;
      setCompanies(res.content);
    } catch (err) {
      toast.error(getErrorMessage(err, "Không thể lấy danh sách công ty."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return (
    <section className="bg-white px-4 py-10">
      <div className="mx-auto mb-6 max-w-7xl text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Top công ty đang tuyển dụng
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Khám phá những công ty hàng đầu với môi trường làm việc lý tưởng
        </p>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {isLoading && (
          <div className="col-span-5 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        )}

        {!isLoading && companies.length === 0 && (
          <div className="col-span-5 flex items-center justify-center">
            <EmptyState
              title="Không tìm thấy công ty nào"
              description="Có thể đã có lỗi xảy ra"
              icon={<Building2 className="text-muted-foreground h-10 w-10" />}
            />
          </div>
        )}

        {!isLoading &&
          companies.length > 0 &&
          companies.map((company) => (
            <Link
              key={company.id}
              to={`/companies/${company.id}`}
              className="group flex flex-col items-center rounded-xl border p-4 text-center transition hover:shadow-md"
            >
              <img
                src={company.logoUrl}
                alt={company.name}
                className="mb-3 h-16 w-16 rounded-xl object-contain"
              />
              <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-800">
                {company.name}
              </h3>
              <span className="text-xs font-medium text-orange-600 group-hover:underline">
                Xem việc làm
              </span>
            </Link>
          ))}
      </div>
    </section>
  );
};

export default TopCompaniesSection;
