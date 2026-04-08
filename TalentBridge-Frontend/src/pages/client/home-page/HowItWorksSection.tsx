import { Briefcase, Send, Bell, ArrowRight } from "lucide-react";

const steps = [
  {
    title: "Tìm việc phù hợp",
    description:
      "Khám phá hàng ngàn cơ hội việc làm chất lượng từ các công ty hàng đầu.",
    icon: Briefcase,
  },
  {
    title: "Rải CV dễ dàng",
    description:
      "Nộp CV chỉ với một cú nhấp. Hệ thống giúp bạn tiết kiệm thời gian.",
    icon: Send,
  },
  {
    title: "Nhận thông báo",
    description:
      "Được cập nhật nhanh chóng khi có nhà tuyển dụng xem và phản hồi.",
    icon: Bell,
  },
];

const HowItWorksSection = () => {
  return (
    <section className="bg-white px-4 py-10">
      <div className="mx-auto mb-6 max-w-5xl text-center">
        <h2 className="text-2xl font-bold text-orange-600">
          Cách thức hoạt động
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Chỉ với 3 bước đơn giản, bạn đã sẵn sàng cho công việc mơ ước
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
        {steps.map(({ title, description, icon: Icon }, index) => (
          <div key={index} className="flex items-center">
            {/* Step card */}
            <div className="flex w-56 flex-col items-center rounded-lg border border-orange-200 bg-orange-50 px-4 py-5 text-center transition hover:shadow-md">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <Icon className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-orange-700">
                {title}
              </h3>
              <p className="text-xs text-gray-600">{description}</p>
            </div>

            {/* Arrow (except last) */}
            {index < steps.length - 1 && (
              <div className="mx-3 hidden sm:flex">
                <ArrowRight className="h-5 w-5 text-orange-400" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorksSection;
