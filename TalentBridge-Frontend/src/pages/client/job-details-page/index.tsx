import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { findJobById } from "@/services/jobApi.ts";
import { toast } from "sonner";
import { getErrorMessage } from "@/features/slices/auth/authThunk.ts";
import LoadingSpinner from "@/components/custom/LoadingSpinner.tsx";
import type { Job } from "@/types/job";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb.tsx";
import JobSection from "./JobSection.tsx";
import { ApplySection } from "./ApplySection.tsx";
import { ViewApplicantCountButton } from "@/components/custom/ViewApplicantCountButton";

import {
  DollarSign,
  MapPin,
  Users,
  Clock,
  CalendarDays,
  Info
} from "lucide-react";
import { formatISO, formatSalary } from "@/utils/convertHelper.ts";

type JobDetailsProp = {
  initialJob?: Job;
};

const JobDetailsClientPage = ({ initialJob }: JobDetailsProp) => {
  const [isLoading, setIsLoading] = useState(false);
  const [job, setJob] = useState<Job | undefined>(initialJob);
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Show toast if redirected from successful payment
  useEffect(() => {
    if (searchParams.get("paymentSuccess") === "true") {
      toast.success("Thanh toán thành công! Bạn có thể xem số người ứng tuyển.");
      // Remove the query param to prevent showing toast on refresh
      searchParams.delete("paymentSuccess");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }

    const fetchJob = async () => {
      setIsLoading(true);
      try {
        const res = (await findJobById(Number.parseInt(id))).data.data;
        setJob(res);
      } catch (err) {
        toast.error(getErrorMessage(err, "Không thể lấy thông tin công việc"));
      } finally {
        setIsLoading(false);
      }
    };

    if (!initialJob) fetchJob();
  }, [id, navigate, initialJob]);

  if (isLoading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="container mx-auto my-8 max-w-7xl px-4 md:px-8 lg:px-12">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={() => navigate("/jobs")}
              className="cursor-pointer"
            >
              Danh sách việc làm
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{job.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        {/* Cột trái: Nội dung chính (Rộng hơn) */}
        <div className="w-full space-y-8 lg:w-[68%]">
          <JobSection job={job} />
        </div>

        {/* Cột phải: Sidebar thông tin & Ứng tuyển (Gọn hơn) */}
        <div className="w-full lg:w-[32%]">
          <div className="sticky top-24 space-y-6">
            {/* HasPermission logic moved inside ApplySection or handled by logic */}
            <ApplySection
              jobId={job.id}
              jobTitle={job.name}
              endDate={job.endDate}
              isActive={job.status === "ACTIVE"}
            />

            {/* General Info Card */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900 border-b pb-3">
                <Info className="h-5 w-5 text-orange-600" />
                Thông tin chung
              </h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1 rounded-full bg-orange-50 p-2 text-orange-600">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 text-nowrap">Mức lương</p>
                    <p className="text-base font-bold text-gray-900">{formatSalary(job.salary)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 rounded-full bg-orange-50 p-2 text-orange-600">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 text-nowrap">Địa điểm làm việc</p>
                    <p className="text-base font-semibold text-gray-900">{job.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 rounded-full bg-orange-50 p-2 text-orange-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 text-nowrap">Số lượng tuyển</p>
                    <p className="text-base font-semibold text-gray-900">{job.quantity} người</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 rounded-full bg-orange-50 p-2 text-orange-600">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 text-nowrap">Hạn nộp hồ sơ</p>
                    <p className="text-base font-bold text-red-600">{formatISO(job.endDate)}</p>
                  </div>
                </div>

                <div className="pt-4 border-t flex items-center gap-2 text-gray-500">
                  <CalendarDays className="h-4 w-4" />
                  <span className="text-xs">Ngày đăng: {formatISO(job.startDate)}</span>
                </div>
              </div>
            </div>

            {/* View Applicant Count Button */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-gray-700">
                Thông tin ứng tuyển
              </h3>
              <ViewApplicantCountButton jobId={job.id} jobName={job.name} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsClientPage;
