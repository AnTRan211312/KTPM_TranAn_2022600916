import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, Star, Trash2, Edit, Loader2, Download, Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getMyCVs, deleteUserCV, setDefaultCV } from "@/services/userCvApi";
import { CV_TEMPLATES, type UserCVSummaryDto } from "@/types/cv";
import { toast } from "sonner";
import { getErrorMessage } from "@/features/slices/auth/authThunk";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function CVBuilderPage() {
    const navigate = useNavigate();
    const [cvList, setCvList] = useState<UserCVSummaryDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        fetchCVs();
    }, []);

    const fetchCVs = async () => {
        try {
            const response = await getMyCVs();
            setCvList(response.data.data);
        } catch (error) {
            toast.error(getErrorMessage(error, "Không thể tải danh sách CV"));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateNew = () => {
        navigate("/user/cv-builder/new");
    };

    const handleEdit = (id: number) => {
        navigate(`/user/cv-builder/edit/${id}`);
    };

    const handleDelete = async (id: number) => {
        setDeletingId(id);
        try {
            await deleteUserCV(id);
            setCvList((prev) => prev.filter((cv) => cv.id !== id));
            toast.success("Đã xóa CV thành công");
        } catch (error) {
            toast.error(getErrorMessage(error, "Không thể xóa CV"));
        } finally {
            setDeletingId(null);
        }
    };

    const handleSetDefault = async (id: number) => {
        try {
            await setDefaultCV(id);
            setCvList((prev) =>
                prev.map((cv) => ({
                    ...cv,
                    isDefault: cv.id === id,
                }))
            );
            toast.success("Đã đặt CV làm mặc định");
        } catch (error) {
            toast.error(getErrorMessage(error, "Không thể đặt CV mặc định"));
        }
    };

    const getTemplate = (templateId: string) => {
        return CV_TEMPLATES.find((t) => t.id === templateId) || CV_TEMPLATES[0];
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-orange-500" />
                    <p className="mt-4 text-gray-500">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-orange-50 py-8">
            <div className="mx-auto max-w-6xl px-4">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-3xl font-bold text-transparent">
                            CV Builder
                        </h1>
                        <p className="mt-1 text-gray-500">
                            Tạo CV chuyên nghiệp với các template đẹp mắt
                        </p>
                    </div>
                    <Button
                        onClick={handleCreateNew}
                        className="gap-2 bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-orange-700"
                        size="lg"
                    >
                        <Plus className="h-5 w-5" />
                        Tạo CV mới
                    </Button>
                </div>

                {/* Tips Banner */}
                <div className="mb-8 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white shadow-xl">
                    <div className="flex items-start gap-4">
                        <div className="rounded-full bg-white/20 p-3">
                            <Sparkles className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Mẹo tạo CV ấn tượng</h3>
                            <p className="mt-1 text-purple-100">
                                Hãy điền đầy đủ thông tin cá nhân, kinh nghiệm và kỹ năng để tạo CV chuyên nghiệp.
                                Sử dụng AI để nhận gợi ý nội dung phù hợp!
                            </p>
                        </div>
                    </div>
                </div>

                {/* CV List */}
                {cvList.length === 0 ? (
                    <Card className="border-2 border-dashed border-gray-200 bg-white/50">
                        <CardContent className="flex flex-col items-center justify-center py-20">
                            <div className="rounded-full bg-orange-100 p-6">
                                <FileText className="h-12 w-12 text-orange-500" />
                            </div>
                            <h3 className="mt-6 text-xl font-semibold text-gray-800">
                                Chưa có CV nào
                            </h3>
                            <p className="mt-2 text-center text-gray-500">
                                Bắt đầu tạo CV chuyên nghiệp của bạn ngay hôm nay
                            </p>
                            <Button
                                onClick={handleCreateNew}
                                className="mt-8 gap-2 bg-gradient-to-r from-orange-500 to-orange-600 px-8 shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-orange-700"
                                size="lg"
                            >
                                <Plus className="h-5 w-5" />
                                Tạo CV đầu tiên
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {cvList.map((cv) => {
                            const template = getTemplate(cv.templateId);
                            return (
                                <Card
                                    key={cv.id}
                                    className="group relative overflow-hidden bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                                >
                                    {/* Template color gradient */}
                                    <div
                                        className="h-24 relative overflow-hidden"
                                        style={{
                                            background: `linear-gradient(135deg, ${template.primaryColor}20, ${template.primaryColor}40)`
                                        }}
                                    >
                                        {/* Template preview mini */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div
                                                className="h-16 w-12 rounded bg-white shadow-lg"
                                                style={{ borderTop: `3px solid ${template.primaryColor}` }}
                                            >
                                                <div className="p-1.5">
                                                    <div
                                                        className="h-3 w-3 mx-auto rounded-full mb-1"
                                                        style={{ backgroundColor: `${template.primaryColor}30` }}
                                                    />
                                                    <div className="space-y-0.5">
                                                        <div
                                                            className="h-1 w-full rounded"
                                                            style={{ backgroundColor: template.primaryColor }}
                                                        />
                                                        <div className="h-0.5 w-3/4 mx-auto rounded bg-gray-200" />
                                                        <div className="h-0.5 w-2/3 mx-auto rounded bg-gray-200" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Default badge */}
                                        {cv.isDefault && (
                                            <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-yellow-500 px-3 py-1 text-xs font-medium text-white shadow-lg">
                                                <Star className="h-3 w-3 fill-white" />
                                                Mặc định
                                            </div>
                                        )}
                                    </div>

                                    <CardHeader className="pb-2 pt-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 line-clamp-1">
                                                    {cv.name}
                                                </h3>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <span
                                                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                                                        style={{
                                                            backgroundColor: `${template.primaryColor}15`,
                                                            color: template.primaryColor,
                                                        }}
                                                    >
                                                        <span
                                                            className="h-1.5 w-1.5 rounded-full"
                                                            style={{ backgroundColor: template.primaryColor }}
                                                        />
                                                        {template.name}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="pt-2">
                                        <p className="text-xs text-gray-400">
                                            Cập nhật: {new Date(cv.updatedAt).toLocaleDateString("vi-VN", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}
                                        </p>

                                        {/* Actions */}
                                        <div className="mt-4 flex gap-2">
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="flex-1 gap-1.5 bg-gray-900 hover:bg-gray-800"
                                                onClick={() => handleEdit(cv.id)}
                                            >
                                                <Edit className="h-3.5 w-3.5" />
                                                Chỉnh sửa
                                            </Button>

                                            {!cv.isDefault && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleSetDefault(cv.id)}
                                                    title="Đặt làm mặc định"
                                                    className="hover:bg-yellow-50 hover:border-yellow-300"
                                                >
                                                    <Star className="h-4 w-4 text-yellow-500" />
                                                </Button>
                                            )}

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                                        disabled={deletingId === cv.id}
                                                    >
                                                        {deletingId === cv.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Xác nhận xóa CV?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Bạn có chắc muốn xóa CV "{cv.name}"? Hành động này
                                                            không thể hoàn tác.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(cv.id)}
                                                            className="bg-red-500 hover:bg-red-600"
                                                        >
                                                            Xóa
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {/* Add new CV card */}
                        <Card
                            className="flex cursor-pointer items-center justify-center border-2 border-dashed border-gray-200 bg-white/50 transition-all duration-300 hover:border-orange-300 hover:bg-orange-50/50"
                            onClick={handleCreateNew}
                        >
                            <CardContent className="flex flex-col items-center py-16">
                                <div className="rounded-full bg-gradient-to-br from-orange-100 to-orange-200 p-5 shadow-lg shadow-orange-200/50">
                                    <Plus className="h-8 w-8 text-orange-600" />
                                </div>
                                <p className="mt-4 font-semibold text-gray-700">Tạo CV mới</p>
                                <p className="mt-1 text-sm text-gray-400">Chọn template và bắt đầu</p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
