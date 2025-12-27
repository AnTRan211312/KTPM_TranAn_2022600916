package com.TranAn.BackEnd_Works.dto.request.user;

import com.TranAn.BackEnd_Works.model.constant.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class UserCreateRequestDto {

    @NotBlank(message = "Tên người dùng không được để trống")
    private String name;

    @NotBlank(message = "Email người dùng không được để trống")
    @Email(
            message = "Định dạng email không hợp lệ",
            regexp = "^[\\w\\-.]+@([\\w\\-]+\\.)+[\\w\\-]{2,4}$"
    )
    private String email;

    @NotBlank(message = "Mật khẩu người dùng không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String password;

    private LocalDate dob;

    private String address;

    private Gender gender;

    private CompanyIdDto company;

    private RoleIdDto role;

}

