import { Brain, Bell, Crown, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
    {
        id: 1,
        title: "AI Phân tích CV",
        description: "Nộp CV ứng tuyển → AI đánh giá và gợi ý cải thiện",
        icon: Brain,
        iconBg: "from-purple-500 to-indigo-600",
        link: "/jobs",
        badge: "🔥 Hot",
    },
    {
        id: 2,
        title: "Thông báo việc làm",
        description: "Nhận email khi có việc phù hợp",
        icon: Bell,
        iconBg: "from-orange-500 to-amber-500",
        link: "/subscription",
        badge: "⚡ Mới",
    },
    {
        id: 3,
        title: "Dành cho NTD",
        description: "Xem số ứng viên, bộ lọc CV nâng cao",
        icon: Crown,
        iconBg: "from-blue-500 to-cyan-500",
        link: "/recruiter/pricing",
        badge: "👑 Premium",
    },
];

const FeaturesSection = () => {
    return (
        <section className="bg-gradient-to-r from-gray-50 to-white px-4 py-8">
            <div className="mx-auto max-w-6xl">
                {/* Compact Header */}
                <div className="mb-6 flex items-center justify-center gap-2">
                    <Sparkles className="h-5 w-5 text-orange-500" />
                    <span className="text-sm font-medium text-gray-600">
                        Tính năng nổi bật dành cho bạn
                    </span>
                </div>

                {/* Compact Feature Cards - Horizontal Strip */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {features.map((feature) => (
                        <Link
                            key={feature.id}
                            to={feature.link}
                            className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                        >
                            {/* Icon */}
                            <div
                                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${feature.iconBg} text-white shadow transition-transform group-hover:scale-110`}
                            >
                                <feature.icon className="h-6 w-6" />
                            </div>

                            {/* Content */}
                            <div className="min-w-0 flex-1">
                                <div className="mb-1 flex items-center gap-2">
                                    <h3 className="truncate text-sm font-bold text-gray-900">
                                        {feature.title}
                                    </h3>
                                    <span className="whitespace-nowrap rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                                        {feature.badge}
                                    </span>
                                </div>
                                <p className="truncate text-xs text-gray-500">
                                    {feature.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
