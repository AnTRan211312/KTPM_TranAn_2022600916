package com.TranAn.BackEnd_Works.model;

import com.TranAn.BackEnd_Works.model.common.BaseEntity;
import com.TranAn.BackEnd_Works.model.constant.Gender;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "users")
@AllArgsConstructor
@NoArgsConstructor
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@JsonPropertyOrder({ "id", "name", "email", "password", "age", "address", "gender" })
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private LocalDate dob;

    private String address;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private String logoUrl;

    @ManyToOne
    @JoinColumn(name = "company_id")
    @ToString.Exclude
    private Company company;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<Resume> resumes;

    @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @ToString.Exclude
    @JsonIgnore
    private List<ChatMessage> chatMessages;

    @ManyToOne
    @JoinColumn(name = "role_id")
    @ToString.Exclude
    private Role role;

    public User(String email, String name, String password, LocalDate dob, String address, Gender gender) {
        this.email = email;
        this.name = name;
        this.password = password;
        this.dob = dob;
        this.address = address;
        this.gender = gender;
    }
}
