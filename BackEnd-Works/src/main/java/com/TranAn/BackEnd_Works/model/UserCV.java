package com.TranAn.BackEnd_Works.model;

import com.TranAn.BackEnd_Works.model.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_cvs")
@AllArgsConstructor
@NoArgsConstructor
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@Builder
public class UserCV extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false)
    private String name; // VD: "CV Software Engineer", "CV Full Stack Developer"

    @Column(nullable = false)
    private String templateId; // VD: "modern", "classic", "professional", "creative"

    @Column(columnDefinition = "TEXT")
    @Lob
    private String cvData; // JSON string chứa toàn bộ CV data

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    private User user;

    private Boolean isDefault; // CV mặc định khi ứng tuyển
}
