package com.TranAn.BackEnd_Works.repository;

import com.TranAn.BackEnd_Works.model.UserCV;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserCVRepository extends JpaRepository<UserCV, Long>, JpaSpecificationExecutor<UserCV> {

    List<UserCV> findByUserIdOrderByUpdatedAtDesc(Long userId);

    Page<UserCV> findByUserId(Long userId, Pageable pageable);

    Optional<UserCV> findByIdAndUserId(Long id, Long userId);

    Optional<UserCV> findByUserIdAndIsDefaultTrue(Long userId);

    boolean existsByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);
}
