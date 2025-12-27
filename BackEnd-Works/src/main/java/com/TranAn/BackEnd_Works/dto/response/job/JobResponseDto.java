package com.TranAn.BackEnd_Works.dto.response.job;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JobResponseDto {
    private Long id;
    private String name;
    private String location;
    private Double salary;
    private Integer quantity;
    private String level;
    private String description;
    private Instant startDate;
    private Instant endDate;
    private String status;

    private CompanyDto company;
    private List<SkillDto> skills;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CompanyDto {
        private Long id;
        private String name;
        private String logoUrl;
        private String address;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SkillDto {
        private Long id;
        private String name;
    }
}
