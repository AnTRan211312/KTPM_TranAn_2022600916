package com.TranAn.BackEnd_Works.dto.response;

import com.TranAn.BackEnd_Works.model.constant.MessageRole;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.Instant;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatMessageDto {

    private Long id;
    private MessageRole role;
    private String content;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+7")
    private Instant createdAt;

    private String createdBy;

    private List<String> attachmentUrls;
    private List<String> attachmentTypes;
}