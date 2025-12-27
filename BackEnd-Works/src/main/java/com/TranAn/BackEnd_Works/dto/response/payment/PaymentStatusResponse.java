package com.TranAn.BackEnd_Works.dto.response.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentStatusResponse {
    private boolean paid;
    private Long applicantCount;
    private String jobName;
}
