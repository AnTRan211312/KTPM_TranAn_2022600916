import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CVPersonalInfo } from "@/types/cv";

interface PersonalInfoFormProps {
    data: CVPersonalInfo;
    onChange: (data: CVPersonalInfo) => void;
}

export function PersonalInfoForm({ data, onChange }: PersonalInfoFormProps) {
    const handleChange = (field: keyof CVPersonalInfo, value: string) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Thông tin cá nhân</h3>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="fullName">Họ và tên *</Label>
                    <Input
                        id="fullName"
                        value={data.fullName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("fullName", e.target.value)}
                        placeholder="Nguyễn Văn A"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="title">Chức danh</Label>
                    <Input
                        id="title"
                        value={data.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("title", e.target.value)}
                        placeholder="Senior Software Engineer"
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("email", e.target.value)}
                        placeholder="email@example.com"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                        id="phone"
                        value={data.phone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("phone", e.target.value)}
                        placeholder="0901 234 567"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Input
                    id="address"
                    value={data.address}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("address", e.target.value)}
                    placeholder="Quận 1, TP. Hồ Chí Minh"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="summary">Giới thiệu bản thân</Label>
                <Textarea
                    id="summary"
                    value={data.summary}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange("summary", e.target.value)}
                    placeholder="Mô tả ngắn về bản thân, kinh nghiệm và mục tiêu nghề nghiệp..."
                    rows={4}
                />
            </div>

            <div className="border-t pt-4">
                <h4 className="mb-3 text-sm font-medium text-gray-600">Liên kết (Tùy chọn)</h4>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                            id="linkedin"
                            value={data.linkedin || ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("linkedin", e.target.value)}
                            placeholder="linkedin.com/in/username"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="github">GitHub</Label>
                        <Input
                            id="github"
                            value={data.github || ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("github", e.target.value)}
                            placeholder="github.com/username"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                            id="website"
                            value={data.website || ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("website", e.target.value)}
                            placeholder="yourwebsite.com"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
