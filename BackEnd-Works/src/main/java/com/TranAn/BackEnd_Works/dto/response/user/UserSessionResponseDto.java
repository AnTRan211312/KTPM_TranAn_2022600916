package com.TranAn.BackEnd_Works.dto.response.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class UserSessionResponseDto {
        private String email;
        private String name;
        private Long id;
        private String companyId;
        private String role;
        private List<String> permissions;
        private String logoUrl;
        private String updatedAt;
}

