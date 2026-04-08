package com.TranAn.BackEnd_Works.dto.response.company;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class DefaultCompanyResponseDto implements Serializable {

    private Long id;
    private String name;
    private String description;
    private String address;
    private String logoUrl;
    private String createdAt;
    private String updatedAt;

}
