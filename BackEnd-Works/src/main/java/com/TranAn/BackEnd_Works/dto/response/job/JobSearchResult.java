package com.TranAn.BackEnd_Works.dto.response.job;

import java.util.List;

/**
 * Lightweight projection of Job used exclusively by the AI chat tools.
 * Contains only the fields that the AI needs to compose a meaningful job listing summary.
 * Using record for immutability (Java 14+).
 */
public record JobSearchResult(
        Long id,
        String title,
        String company,
        String location,
        double salaryMillionVnd,
        String level,
        String status,
        List<String> skills,
        String endDate
) {}
