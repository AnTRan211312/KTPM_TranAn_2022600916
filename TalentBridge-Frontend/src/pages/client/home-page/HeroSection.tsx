import { Search, Sparkles, Brain, Bell, Crown, FileText } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "@/features/hooks";
import { toast } from "sonner";

const features = [
  {
    title: "AI Phân tích CV",
    desc: "Nộp CV → AI đánh giá",
    icon: Brain,
    color: "text-purple-600 bg-purple-100",
    link: "/jobs",
    requiresAuth: false,
  },
  {
    title: "Thông báo việc làm",
    desc: "Email khi có việc phù hợp",
    icon: Bell,
    color: "text-orange-600 bg-orange-100",
    link: "/user/subscriber",
    requiresAuth: true,
  },
  {
    title: "Dành cho NTD",
    desc: "Xem số ứng viên, lọc CV",
    icon: Crown,
    color: "text-blue-600 bg-blue-100",
    link: "/recruiter/pricing",
    requiresAuth: false,
  },
];

const HeroSection = () => {
  const navigate = useNavigate();
  const { isLogin } = useAppSelector((state) => state.auth);

  const handleFeatureClick = (
    e: React.MouseEvent,
    feature: (typeof features)[0]
  ) => {
    if (feature.requiresAuth && !isLogin) {
      e.preventDefault();
      // Redirect to login with return URL
      navigate(`/auth?redirect=${encodeURIComponent(feature.link)}`);
    }
  };

  return (
    <section className="w-full bg-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        {/* Main Hero Content */}
        <div className="flex flex-col-reverse items-center md:flex-row md:space-x-8">
          {/* Left: Text Content */}
          <div className="w-full space-y-4 text-center md:w-1/2 md:text-left">
            <h1 className="flex items-center justify-center text-3xl font-bold text-gray-800 md:justify-start md:text-4xl">
              <Sparkles className="mr-2 h-6 w-6 text-orange-500" />
              Tìm việc nhanh chóng,
              <br /> Phù hợp với bạn
            </h1>
            <p className="text-sm text-gray-600">
              Khám phá hàng ngàn cơ hội IT được cập nhật liên tục, bộ lọc thông
              minh, hỗ trợ 24/7 để bạn không bỏ lỡ bất kỳ vị trí mơ ước nào.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/jobs"
                className="inline-flex items-center justify-center rounded-md bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all hover:bg-orange-600 hover:shadow-orange-500/40"
              >
                <Search className="mr-2 h-4 w-4" />
                Tìm việc ngay
              </Link>
              <button
                onClick={(e) => {
                  if (!isLogin) {
                    toast.error("Vui lòng đăng nhập để sử dụng tính năng này!");
                  } else {
                    navigate("/user/cv-builder");
                  }
                }}
                className="inline-flex items-center justify-center rounded-md border-2 border-orange-500 bg-white px-6 py-3 text-sm font-semibold text-orange-600 transition-all hover:bg-orange-50"
              >
                <FileText className="mr-2 h-4 w-4" />
                Tạo CV đẹp
              </button>
            </div>
          </div>

          {/* Right: Image */}
          <div className="mb-6 flex w-full justify-center md:mb-0 md:w-1/2">
            <img
              src="hero-img.png"
              alt="Hero"
              className="h-64 object-contain"
            />
          </div>
        </div>

        {/* Feature Highlights - Integrated */}
        <div className="mt-8 grid grid-cols-1 gap-3 border-t border-gray-100 pt-6 sm:grid-cols-3">
          {features.map((feature, idx) => (
            <Link
              key={idx}
              to={feature.link}
              onClick={(e) => handleFeatureClick(e, feature)}
              className="group flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 transition hover:bg-white hover:shadow-md"
            >
              <div
                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${feature.color}`}
              >
                <feature.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-gray-900">
                  {feature.title}
                </h3>
                <p className="truncate text-xs text-gray-500">{feature.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
