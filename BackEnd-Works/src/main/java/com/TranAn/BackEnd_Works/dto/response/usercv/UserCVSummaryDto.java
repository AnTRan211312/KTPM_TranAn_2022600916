package com.TranAn.BackEnd_Works.dto.response.usercv;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO tóm tắt cho list CVs (không bao gồm cvData để reduce payload)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCVSummaryDto {

    private Long id;
    private String name;
    private String templateId;
    private Boolean isDefault;
    private Instant createdAt;
    private Instant updatedAt;
}
