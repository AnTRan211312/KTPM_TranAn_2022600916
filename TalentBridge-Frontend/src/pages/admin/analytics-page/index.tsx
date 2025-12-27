import {
    BarChart3,
    Loader2,
    RefreshCw,
    Users,
    Briefcase,
    FileText,
    TrendingUp,
    TrendingDown,
    Minus,
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


// Custom Tooltip hiển thị đầy đủ tên khi hover vào bar
const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const fullName = data.fullName || label;
        const value = payload[0].value;
        const dataKey = payload[0].dataKey;

        return (
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg animate-in fade-in-0 zoom-in-95 duration-150">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                    {fullName}
                </p>
                <p className="text-sm text-gray-600">
                    {dataKey}: <span className="font-medium text-gray-900">{value}</span>
                </p>
            </div>
        );
    }
    return null;
};

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
        if (Math.abs(num) < 0.05) return "0%";
        const sign = num > 0 ? "+" : "";
        return `${sign}${num.toFixed(1)}%`;
    };

    const renderGrowth = (rate: number | null | undefined) => {
        const effectiveRate = rate ?? 0;

        let color = "text-yellow-600";
        let Icon = Minus;

        if (effectiveRate > 0.05) {
            color = "text-green-600";
            Icon = TrendingUp;
        } else if (effectiveRate < -0.05) {
            color = "text-red-600";
            Icon = TrendingDown;
        }

        return (
            <div className={`mt-1 flex items-center text-xs ${color}`}>
                <Icon className="mr-1 h-3 w-3" />
                {formatPercentage(effectiveRate)} so với tháng trước
            </div>
        );
    };

    const formatMonth = (monthStr: string): string => {
        // Format "2024-01" -> "T1/2024"
        if (!monthStr) return "";
        const [year, month] = monthStr.split("-");
        return `T${parseInt(month)}/${year}`;
    };

    const formatMonthShort = (monthStr: string): string => {
        // Format "2024-01" -> "1"
        if (!monthStr) return "";
        const [, month] = monthStr.split("-");
        return `${parseInt(month)}`;
    };

    const CustomDot = (props: any) => {
        const { cx, cy, stroke, value } = props;
        if (value === 0) return null;
        return (
            <circle cx={cx} cy={cy} r={4} stroke={stroke} strokeWidth={2} fill="#fff" />
        );
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6 overflow-auto p-6" style={{ maxHeight: 'calc(100vh - 80px)' }}>
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
                                {renderGrowth(stats.overviewStats?.userGrowthRate)}
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
                                {renderGrowth(stats.overviewStats?.jobGrowthRate)}
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
                                {renderGrowth(stats.overviewStats?.resumeGrowthRate)}
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
                                            formatMonthShort(item.month),
                                        );
                                        return months.map((month, index) => ({
                                            month,
                                            "Người dùng": stats.chartData?.usersByMonth[index]?.count || 0,
                                            "Việc làm": stats.chartData?.jobsByMonth[index]?.count || 0,
                                            "Hồ sơ": stats.chartData?.resumesByMonth[index]?.count || 0,
                                        }));
                                    })()}
                                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="5 5" stroke="#cccccc" />
                                    <XAxis
                                        dataKey="month"
                                        height={40}
                                        tick={{ fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    {/* Trục trái cho Việc làm & Hồ sơ (Số lượng nhỏ) */}
                                    <YAxis
                                        yAxisId="left"
                                        allowDecimals={false}
                                        tickLine={false}
                                        axisLine={{ stroke: "#cccccc" }}
                                        tick={{ fontSize: 12, fill: "#333333" }}
                                        width={40}
                                    />
                                    {/* Trục phải cho Người dùng (Số lượng lớn) */}
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        allowDecimals={false}
                                        tickLine={false} // Keep tickLine false for cleaner look
                                        axisLine={{ stroke: "#cccccc" }} // Make axisLine more visible
                                        tick={{ fontSize: 12, fill: "#333333" }} // Darker fill for better contrast
                                        width={40}
                                    />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Legend />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="Người dùng"
                                        name="Người dùng (Phải)"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={<CustomDot />}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="Việc làm"
                                        name="Việc làm (Trái)"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        dot={<CustomDot />}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="Hồ sơ"
                                        name="Hồ sơ (Trái)"
                                        stroke="#f59e0b"
                                        strokeWidth={2}
                                        dot={<CustomDot />}
                                        activeDot={{ r: 6 }}
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
                                            "Số lượng": item.count,
                                        }))}
                                        margin={{ bottom: 60 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="month"
                                            height={40}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Bar dataKey="Số lượng" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={60} />
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
                                            "Số lượng": item.count,
                                        }))}
                                        margin={{ bottom: 60 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="month"
                                            height={40}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Bar dataKey="Số lượng" fill="#10b981" radius={[4, 4, 0, 0]} barSize={60} />
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
                                    <div className="flex items-center justify-between">
                                        <div className="h-[250px] w-1/2">
                                            <ResponsiveContainer width="100%" height="100%" className="outline-none">
                                                <PieChart>
                                                    <Pie
                                                        data={[
                                                            { name: "Admin", value: stats.userStats.adminCount || 0, color: "#3b82f6" },
                                                            { name: "Recruiter", value: stats.userStats.recruiterCount || 0, color: "#10b981" },
                                                            { name: "User", value: stats.userStats.userCount || 0, color: "#f59e0b" },
                                                        ].filter((item) => item.value > 0)}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {[
                                                            { name: "Admin", value: stats.userStats.adminCount || 0, color: "#3b82f6" },
                                                            { name: "Recruiter", value: stats.userStats.recruiterCount || 0, color: "#10b981" },
                                                            { name: "User", value: stats.userStats.userCount || 0, color: "#f59e0b" },
                                                        ].filter((item) => item.value > 0).map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="w-1/2 space-y-3 pl-4">
                                            {[
                                                { name: "Admin", value: stats.userStats.adminCount || 0, color: "#3b82f6" },
                                                { name: "Recruiter", value: stats.userStats.recruiterCount || 0, color: "#10b981" },
                                                { name: "User", value: stats.userStats.userCount || 0, color: "#f59e0b" },
                                            ].map((item, index) => {
                                                const total = (stats.userStats?.adminCount || 0) + (stats.userStats?.recruiterCount || 0) + (stats.userStats?.userCount || 0);
                                                return (
                                                    <div key={index} className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                                                            <span className="text-gray-600">{item.name}</span>
                                                        </div>
                                                        <span className="font-medium text-gray-900">
                                                            {total > 0 ? ((item.value / total) * 100).toFixed(0) : 0}% ({item.value})
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
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
                                    <div className="flex items-center justify-between">
                                        <div className="h-[250px] w-1/2">
                                            <ResponsiveContainer width="100%" height="100%" className="outline-none">
                                                <PieChart>
                                                    <Pie
                                                        data={[
                                                            { name: "Intern", value: stats.jobStats.internJobs || 0, color: "#3b82f6" },
                                                            { name: "Fresher", value: stats.jobStats.fresherJobs || 0, color: "#10b981" },
                                                            { name: "Middle", value: stats.jobStats.middleJobs || 0, color: "#f59e0b" },
                                                            { name: "Senior", value: stats.jobStats.seniorJobs || 0, color: "#8b5cf6" },
                                                            { name: "Leader", value: stats.jobStats.leaderJobs || 0, color: "#ec4899" },
                                                        ].filter((item) => item.value > 0)}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {[
                                                            { name: "Intern", value: stats.jobStats.internJobs || 0, color: "#3b82f6" },
                                                            { name: "Fresher", value: stats.jobStats.fresherJobs || 0, color: "#10b981" },
                                                            { name: "Middle", value: stats.jobStats.middleJobs || 0, color: "#f59e0b" },
                                                            { name: "Senior", value: stats.jobStats.seniorJobs || 0, color: "#8b5cf6" },
                                                            { name: "Leader", value: stats.jobStats.leaderJobs || 0, color: "#ec4899" },
                                                        ].filter((item) => item.value > 0).map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="w-1/2 space-y-3 pl-4">
                                            {[
                                                { name: "Intern", value: stats.jobStats.internJobs || 0, color: "#3b82f6" },
                                                { name: "Fresher", value: stats.jobStats.fresherJobs || 0, color: "#10b981" },
                                                { name: "Middle", value: stats.jobStats.middleJobs || 0, color: "#f59e0b" },
                                                { name: "Senior", value: stats.jobStats.seniorJobs || 0, color: "#8b5cf6" },
                                                { name: "Leader", value: stats.jobStats.leaderJobs || 0, color: "#ec4899" },
                                            ].map((item, index) => {
                                                const total = (stats.jobStats?.internJobs || 0) + (stats.jobStats?.fresherJobs || 0) + (stats.jobStats?.middleJobs || 0) + (stats.jobStats?.seniorJobs || 0) + (stats.jobStats?.leaderJobs || 0);
                                                return (
                                                    <div key={index} className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                                                            <span className="text-gray-600">{item.name}</span>
                                                        </div>
                                                        <span className="font-medium text-gray-900">
                                                            {total > 0 ? ((item.value / total) * 100).toFixed(0) : 0}% ({item.value})
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
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
                                                            fullName: item.companyName,
                                                            "Số hồ sơ": item.resumeCount,
                                                        }))}
                                                    layout="vertical"
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis type="number" allowDecimals={false} />
                                                    <YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 13 }} />
                                                    <Tooltip content={<CustomBarTooltip />} />
                                                    <Bar dataKey="Số hồ sơ" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
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
                                                            fullName: item.jobName,
                                                            "Số hồ sơ": item.resumeCount,
                                                        }))}
                                                    layout="vertical"
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis type="number" allowDecimals={false} />
                                                    <YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 13 }} />
                                                    <Tooltip content={<CustomBarTooltip />} />
                                                    <Bar dataKey="Số hồ sơ" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={24} />
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
                                            fullName: item.skillName,
                                            "Số lượng": item.count,
                                        }))}
                                        layout="vertical"
                                        margin={{ left: 10 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" allowDecimals={false} />
                                        <YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 13 }} />
                                        <Tooltip content={<CustomBarTooltip />} />
                                        <Bar dataKey="Số lượng" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={24} />
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
