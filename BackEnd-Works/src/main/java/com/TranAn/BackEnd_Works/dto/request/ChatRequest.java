package com.TranAn.BackEnd_Works.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatRequest {

    @NotBlank(message = "Câu hỏi không được để trống")
    @Size(max = 500, message = "Câu hỏi không được quá 5000 ký tự")
    private String question;

    @NotBlank(message = "SessionId không được để trống")
    @Size(max = 100, message = "SessionId không hợp lệ")
    private String sessionId;
}