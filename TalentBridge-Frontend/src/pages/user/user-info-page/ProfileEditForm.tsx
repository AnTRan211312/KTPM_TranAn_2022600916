import type React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  SelfUserUpdateProfileRequestDto,
  UserDetailsResponseDto,
} from "@/types/user.d.ts";
import { Save, User } from "lucide-react";
import { useEffect, useState } from "react";

interface ProfileEditFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userDetails: UserDetailsResponseDto;
  onSubmit: (data: SelfUserUpdateProfileRequestDto) => void;
  isLoading?: boolean;
}

const ProfileEditForm = ({
  open,
  onOpenChange,
  userDetails,
  onSubmit,
  isLoading = false,
}: ProfileEditFormProps) => {
  const [formData, setFormData] = useState<SelfUserUpdateProfileRequestDto>({
    name: userDetails.name,
    dob: userDetails.dob ? userDetails.dob.split("T")[0] : "",
    address: userDetails.address,
    gender: userDetails.gender,
  });

  // Reset form when opening
  useEffect(() => {
    if (open) {
      setFormData({
        name: userDetails.name,
        dob: userDetails.dob ? userDetails.dob.split("T")[0] : "",
        address: userDetails.address,
        gender: userDetails.gender,
      });
    }
  }, [open, userDetails]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      dob: new Date(formData.dob).toISOString(),
    };
    onSubmit(submitData);
  };

  const handleInputChange = (
    field: keyof SelfUserUpdateProfileRequestDto,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-orange-800">
            <User className="h-5 w-5" />
            Cập nhật thông tin cá nhân
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Name Field */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Họ và tên *
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nhập họ và tên"
              />
            </div>

            {/* Date of Birth Field */}
            <div className="space-y-2">
              <Label
                htmlFor="dob"
                className="text-sm font-medium text-gray-700"
              >
                Ngày sinh *
              </Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob}
                onChange={(e) => handleInputChange("dob", e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            {/* Gender Field */}
            <div className="space-y-2">
              <Label
                htmlFor="gender"
                className="text-sm font-medium text-gray-700"
              >
                Giới tính *
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value: "MALE" | "FEMALE" | "OTHER") =>
                  handleInputChange("gender", value)
                }
              >
                <SelectTrigger className="border-gray-300 focus:border-orange-500">
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Nam</SelectItem>
                  <SelectItem value="FEMALE">Nữ</SelectItem>
                  <SelectItem value="OTHER">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Address Field */}
            <div className="space-y-2">
              <Label
                htmlFor="address"
                className="text-sm font-medium text-gray-700"
              >
                Địa chỉ *
              </Label>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Nhập địa chỉ đầy đủ"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-orange-500 text-white hover:bg-orange-600"
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Cập nhật thông tin
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50"
            >
              Hủy bỏ
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditForm;
