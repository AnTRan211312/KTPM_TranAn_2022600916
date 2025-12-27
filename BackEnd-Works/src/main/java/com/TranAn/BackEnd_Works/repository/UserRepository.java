package com.TranAn.BackEnd_Works.repository;

import com.TranAn.BackEnd_Works.model.Company;
import com.TranAn.BackEnd_Works.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends
        JpaRepository<User, Long>,
        JpaSpecificationExecutor<User> {

    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    @Modifying
    @Query("UPDATE User u SET u.company = null WHERE u.company = :company")
    void detachUsersFromCompany(@Param("company") Company company);

    @Modifying
    @Query("UPDATE User u SET u.role = null WHERE u.role.id = :roleId")
    void detachUsersFromRole(@Param("roleId") Long roleId);

    List<User> findByCompanyId(Long companyId);

    long count();

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :start")
    Long countByCreatedAtAfter(@Param("start") Instant start);

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :start AND u.createdAt < :end")
    Long countByCreatedAtBetween(@Param("start") Instant start, @Param("end") Instant end);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role.name = :roleName")
    Long countByRole_Name(@Param("roleName") String roleName);

    // Tìm tất cả users có role cụ thể (ADMIN, RECRUITER, etc.)
    List<User> findByRole_Name(String roleName);
}
