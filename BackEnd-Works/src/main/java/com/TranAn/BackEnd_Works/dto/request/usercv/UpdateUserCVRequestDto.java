package com.TranAn.BackEnd_Works.dto.request.usercv;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserCVRequestDto {

    @NotNull(message = "ID không được để trống")
    private Long id;

    @NotBlank(message = "Tên CV không được để trống")
    @Size(max = 100, message = "Tên CV không được quá 100 ký tự")
    private String name;

    @NotBlank(message = "Template ID không được để trống")
    private String templateId;

    @NotBlank(message = "CV Data không được để trống")
    private String cvData; // JSON string
}
