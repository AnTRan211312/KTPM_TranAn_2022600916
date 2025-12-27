package com.TranAn.BackEnd_Works.model;

import com.TranAn.BackEnd_Works.model.common.BaseEntity;
import com.TranAn.BackEnd_Works.model.constant.JobStatus;
import com.TranAn.BackEnd_Works.model.constant.Level;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "jobs")
@AllArgsConstructor
@NoArgsConstructor
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Job extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private String name;

    private String location;

    private Double salary;

    private Integer quantity;

    @Enumerated(EnumType.STRING)
    private Level level;

    @Column(columnDefinition = "MEDIUMTEXT")
    private String description;

    private Instant startDate;

    private Instant endDate;

    @Enumerated(EnumType.STRING)
    private JobStatus status = JobStatus.ACTIVE;

    @ManyToOne
    @JoinColumn(name = "company_id")
    @ToString.Exclude
    private Company company;

    @ManyToMany
    @JoinTable(name = "job_skill", joinColumns = @JoinColumn(name = "job_id"), inverseJoinColumns = @JoinColumn(name = "skill_id"))
    @ToString.Exclude
    private List<Skill> skills;

    @OneToMany(mappedBy = "job")
    @ToString.Exclude
    private List<Resume> resumes;

    public Job(String name, String location, Double salary, Integer quantity, Level level, String description,
            Instant startDate, Instant endDate, JobStatus status) {
        this.name = name;
        this.location = location;
        this.salary = salary;
        this.quantity = quantity;
        this.level = level;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
    }
}
