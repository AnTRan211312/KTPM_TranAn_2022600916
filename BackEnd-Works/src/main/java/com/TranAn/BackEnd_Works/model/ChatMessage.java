package com.TranAn.BackEnd_Works.model;

import com.TranAn.BackEnd_Works.model.common.BaseEntity;
import com.TranAn.BackEnd_Works.model.constant.MessageRole;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chat_messages", indexes = {
        @Index(name = "idx_user_session", columnList = "user_id, session_id"),
        @Index(name = "idx_created_at", columnList = "created_at")
})
@AllArgsConstructor
@NoArgsConstructor
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@Builder
public class ChatMessage extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    @JsonIgnoreProperties({ "company", "role", "resumes", "password" })
    private User user;

    @Column(name = "session_id", nullable = false, length = 100)
    private String sessionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MessageRole role;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "attachment_urls", columnDefinition = "TEXT")
    private String attachmentUrls; // JSON array of S3 URLs

    @Column(name = "attachment_types", length = 500)
    private String attachmentTypes; // Comma-separated MIME types

}