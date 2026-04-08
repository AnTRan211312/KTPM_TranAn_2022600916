package com.TranAn.BackEnd_Works.dto.response.resume;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserResumeFileDto {
    private Long resumeId;
    private String pdfUrl;
    private String jobName;
    private String companyName;
    private String createdAt;
}
