import {
    BarChart3,
    Loader2,
    RefreshCw,
    Users,
    Briefcase,
    FileText,
    TrendingUp,
    Building2,
    User,
    Mail,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { getDashboardStats } from "@/services/adminDashboardApi";
import type { DashboardStatsResponseDto } from "@/types/adminDashboard.d.ts";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

export default function AnalyticsPage() {
    const [stats, setStats] = useState<DashboardStatsResponseDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDashboardStats();
    }, []);

    const loadDashboardStats = async () => {
        try {
            setIsLoading(true);
            const response = await getDashboardStats();
            setStats(response.data.data);
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Không thể tải thống kê",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const formatNumber = (num: number | null | undefined): string => {
        if (num === null || num === undefined) return "0";
        return new Intl.NumberFormat("vi-VN").format(num);
    };

    const formatPercentage = (num: number | null | undefined): string => {
        if (num === null || num === undefined) return "0%";
        const sign = num >= 0 ? "+" : "";
        return `${sign}${num.toFixed(1)}%`;
    };

    const formatMonth = (monthStr: string): string => {
        // Format "2024-01" -> "T1/2024"
        if (!monthStr) return "";
        const [year, month] = monthStr.split("-");
        return `T${parseInt(month)}/${year}`;
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                    <h1 className="text-2xl font-bold text-gray-900">
                        Thống kê & Báo cáo
                    </h1>
                </div>
                <button
                    onClick={loadDashboardStats}
                    disabled={isLoading}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    Làm mới
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {/* Tổng số người dùng */}
                        <Card className="relative overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">
                                    Tổng số người dùng
                                </CardTitle>
                                <Users className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">
                                    {formatNumber(stats.overviewStats?.totalUsers)}
                                </div>
                                {stats.overviewStats?.userGrowthRate !== null && (
                                    <div className="mt-1 flex items-center text-xs text-green-600">
                                        <TrendingUp className="mr-1 h-3 w-3" />
                                        {formatPercentage(stats.overviewStats.userGrowthRate)} so với tháng trước
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Tổng số công ty */}
                        <Card className="relative overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">
                                    Tổng số công ty
                                </CardTitle>
                                <Building2 className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">
                                    {formatNumber(stats.overviewStats?.totalCompanies)}
                                </div>
                                {stats.overviewStats?.companyGrowthRate !== null && (
                                    <div className="mt-1 flex items-center text-xs text-green-600">
                                        <TrendingUp className="mr-1 h-3 w-3" />
                                        {formatPercentage(stats.overviewStats.companyGrowthRate)} so với tháng trước
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Việc làm đang tuyển */}
                        <Card className="relative overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">
                                    Việc làm đang tuyển
                                </CardTitle>
                                <Briefcase className="h-4 w-4 text-orange-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">
                                    {formatNumber(stats.jobStats?.activeJobs)}
                                </div>
                                {stats.overviewStats?.jobGrowthRate !== null && (
                                    <div className="mt-1 flex items-center text-xs text-green-600">
                                        <TrendingUp className="mr-1 h-3 w-3" />
                                        {formatPercentage(stats.overviewStats.jobGrowthRate)} so với tháng trước
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Hồ sơ ứng tuyển */}
                        <Card className="relative overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">
                                    Hồ sơ ứng tuyển
                                </CardTitle>
                                <FileText className="h-4 w-4 text-purple-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">
                                    {formatNumber(stats.overviewStats?.totalResumes)}
                                </div>
                                {stats.overviewStats?.resumeGrowthRate !== null && (
                                    <div className="mt-1 flex items-center text-xs text-green-600">
                                        <TrendingUp className="mr-1 h-3 w-3" />
                                        {formatPercentage(stats.overviewStats.resumeGrowthRate)} so với tháng trước
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Additional Stats Row */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {/* Người dùng mới tháng này */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">
                                    Người dùng mới (tháng này)
                                </CardTitle>
                                <User className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">
                                    {formatNumber(stats.userStats?.newUsersThisMonth)}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Tổng: {formatNumber(stats.userStats?.totalUsers)} người dùng
                                </p>
                                {stats.userStats?.newUsersGrowthRate !== null && (
                                    <div className="mt-1 flex items-center text-xs text-green-600">
                                        <TrendingUp className="mr-1 h-3 w-3" />
                                        {formatPercentage(stats.userStats.newUsersGrowthRate)} so với tháng trước
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Việc làm mới tháng này */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">
                                    Việc làm mới (tháng này)
                                </CardTitle>
                                <Briefcase className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">
                                    {formatNumber(stats.jobStats?.newJobsThisMonth)}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Tổng: {formatNumber(stats.jobStats?.totalJobs)} việc làm
                                </p>
                                {stats.jobStats?.newJobsGrowthRate !== null && (
                                    <div className="mt-1 flex items-center text-xs text-green-600">
                                        <TrendingUp className="mr-1 h-3 w-3" />
                                        {formatPercentage(stats.jobStats.newJobsGrowthRate)} so với tháng trước
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Hồ sơ mới tháng này */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">
                                    Hồ sơ mới (tháng này)
                                </CardTitle>
                                <FileText className="h-4 w-4 text-orange-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">
                                    {formatNumber(stats.resumeStats?.newResumesThisMonth)}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Tỷ lệ chấp nhận:{" "}
                                    {stats.resumeStats?.approvalRate
                                        ? `${stats.resumeStats.approvalRate.toFixed(1)}%`
                                        : "N/A"}
                                </p>
                                {stats.resumeStats?.newResumesGrowthRate !== null && (
                                    <div className="mt-1 flex items-center text-xs text-green-600">
                                        <TrendingUp className="mr-1 h-3 w-3" />
                                        {formatPercentage(stats.resumeStats.newResumesGrowthRate)} so với tháng trước
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Người đăng ký */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">
                                    Người đăng ký
                                </CardTitle>
                                <Mail className="h-4 w-4 text-purple-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">
                                    {formatNumber(stats.overviewStats?.totalSubscribers)}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Đăng ký nhận thông báo
                                </p>
                                {stats.overviewStats?.subscriberGrowthRate !== null && (
                                    <div className="mt-1 flex items-center text-xs text-green-600">
                                        <TrendingUp className="mr-1 h-3 w-3" />
                                        {formatPercentage(stats.overviewStats.subscriberGrowthRate)} so với tháng trước
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}

            {/* Charts Section */}
            {stats?.chartData && (
                <div className="space-y-6">
                    {/* Line Chart - Growth over time */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tăng trưởng theo tháng (6 tháng gần nhất)</CardTitle>
                            <CardDescription>
                                Thống kê số lượng người dùng, việc làm và hồ sơ theo tháng
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart
                                    data={(() => {
                                        const months = stats.chartData.usersByMonth.map((item) =>
                                            formatMonth(item.month),
                                        );
                                        return months.map((month, index) => ({
                                            month,
                                            "Người dùng": stats.chartData?.usersByMonth[index]?.count || 0,
                                            "Việc làm": stats.chartData?.jobsByMonth[index]?.count || 0,
                                            "Hồ sơ": stats.chartData?.resumesByMonth[index]?.count || 0,
                                        }));
                                    })()}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="month"
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="Người dùng"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="Việc làm"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="Hồ sơ"
                                        stroke="#f59e0b"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Bar Chart - Users by month */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Người dùng mới theo tháng</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={stats.chartData.usersByMonth.map((item) => ({
                                            month: formatMonth(item.month),
                                            count: item.count,
                                        }))}
                                        margin={{ bottom: 60 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="month"
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Bar Chart - Jobs by month */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Việc làm mới theo tháng</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={stats.chartData.jobsByMonth.map((item) => ({
                                            month: formatMonth(item.month),
                                            count: item.count,
                                        }))}
                                        margin={{ bottom: 60 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="month"
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Additional Charts */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Pie Chart - User Distribution by Role */}
                        {stats.userStats && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Phân bố người dùng theo vai trò</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    {
                                                        name: "Admin",
                                                        value: stats.userStats.adminCount || 0,
                                                    },
                                                    {
                                                        name: "Recruiter",
                                                        value: stats.userStats.recruiterCount || 0,
                                                    },
                                                    {
                                                        name: "User",
                                                        value: stats.userStats.userCount || 0,
                                                    },
                                                ].filter((item) => item.value > 0)}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={(entry: any) =>
                                                    `${entry.name}: ${((entry.percent || 0) * 100).toFixed(0)}%`
                                                }
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {[
                                                    { name: "Admin", value: stats.userStats.adminCount || 0 },
                                                    {
                                                        name: "Recruiter",
                                                        value: stats.userStats.recruiterCount || 0,
                                                    },
                                                    { name: "User", value: stats.userStats.userCount || 0 },
                                                ]
                                                    .filter((item) => item.value > 0)
                                                    .map((_, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={
                                                                ["#3b82f6", "#10b981", "#f59e0b"][index % 3]
                                                            }
                                                        />
                                                    ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        )}

                        {/* Pie Chart - Job Distribution by Level */}
                        {stats.jobStats && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Phân bố việc làm theo cấp độ</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: "Intern", value: stats.jobStats.internJobs || 0 },
                                                    {
                                                        name: "Fresher",
                                                        value: stats.jobStats.fresherJobs || 0,
                                                    },
                                                    {
                                                        name: "Middle",
                                                        value: stats.jobStats.middleJobs || 0,
                                                    },
                                                    {
                                                        name: "Senior",
                                                        value: stats.jobStats.seniorJobs || 0,
                                                    },
                                                    {
                                                        name: "Leader",
                                                        value: stats.jobStats.leaderJobs || 0,
                                                    },
                                                ].filter((item) => item.value > 0)}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={(entry: any) =>
                                                    `${entry.name}: ${((entry.percent || 0) * 100).toFixed(0)}%`
                                                }
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {[
                                                    {
                                                        name: "Intern",
                                                        value: stats.jobStats.internJobs || 0,
                                                    },
                                                    {
                                                        name: "Fresher",
                                                        value: stats.jobStats.fresherJobs || 0,
                                                    },
                                                    {
                                                        name: "Middle",
                                                        value: stats.jobStats.middleJobs || 0,
                                                    },
                                                    {
                                                        name: "Senior",
                                                        value: stats.jobStats.seniorJobs || 0,
                                                    },
                                                    {
                                                        name: "Leader",
                                                        value: stats.jobStats.leaderJobs || 0,
                                                    },
                                                ]
                                                    .filter((item) => item.value > 0)
                                                    .map((_, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={
                                                                ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"][
                                                                index % 5
                                                                ]
                                                            }
                                                        />
                                                    ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Top Performers */}
                    {stats.topPerformers && (
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Top Companies by Resumes */}
                            {stats.topPerformers.topCompaniesByResumes &&
                                stats.topPerformers.topCompaniesByResumes.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Top công ty có nhiều ứng viên</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart
                                                    data={stats.topPerformers.topCompaniesByResumes
                                                        .slice(0, 10)
                                                        .map((item) => ({
                                                            name:
                                                                item.companyName.length > 15
                                                                    ? `${item.companyName.substring(0, 15)}...`
                                                                    : item.companyName,
                                                            "Số hồ sơ": item.resumeCount,
                                                        }))}
                                                    layout="vertical"
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis type="number" />
                                                    <YAxis dataKey="name" type="category" width={120} />
                                                    <Tooltip />
                                                    <Bar dataKey="Số hồ sơ" fill="#8b5cf6" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                )}

                            {/* Top Jobs by Resumes */}
                            {stats.topPerformers.topJobsByResumes &&
                                stats.topPerformers.topJobsByResumes.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Top việc làm có nhiều ứng viên</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart
                                                    data={stats.topPerformers.topJobsByResumes
                                                        .slice(0, 10)
                                                        .map((item) => ({
                                                            name:
                                                                item.jobName.length > 20
                                                                    ? `${item.jobName.substring(0, 20)}...`
                                                                    : item.jobName,
                                                            "Số hồ sơ": item.resumeCount,
                                                        }))}
                                                    layout="vertical"
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis type="number" />
                                                    <YAxis dataKey="name" type="category" width={120} />
                                                    <Tooltip />
                                                    <Bar dataKey="Số hồ sơ" fill="#ec4899" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                )}
                        </div>
                    )}

                    {/* Top Skills */}
                    {stats.jobStats?.topSkills && stats.jobStats.topSkills.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Top kỹ năng được yêu cầu nhiều nhất</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart
                                        data={stats.jobStats.topSkills.slice(0, 10).map((item) => ({
                                            name:
                                                item.skillName.length > 15
                                                    ? `${item.skillName.substring(0, 15)}...`
                                                    : item.skillName,
                                            "Số lượng": item.count,
                                        }))}
                                        margin={{ bottom: 80 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="name"
                                            angle={-45}
                                            textAnchor="end"
                                            height={100}
                                            tick={{ fontSize: 11 }}
                                            interval={0}
                                        />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="Số lượng" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
