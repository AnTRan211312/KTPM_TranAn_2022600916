package com.TranAn.BackEnd_Works.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@AllArgsConstructor
@NoArgsConstructor
@Data
public class PageResponseDto<T> {

    private List<T> content;

    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
}

