package com.TranAn.BackEnd_Works.dto.response.usercv;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCVResponseDto {

    private Long id;
    private String name;
    private String templateId;
    private String cvData;
    private Boolean isDefault;
    private Instant createdAt;
    private Instant updatedAt;
}
