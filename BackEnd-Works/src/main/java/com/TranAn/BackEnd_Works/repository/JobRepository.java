package com.TranAn.BackEnd_Works.repository;

import com.TranAn.BackEnd_Works.model.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;


@Repository
public interface JobRepository extends
        JpaRepository<Job, Long>,
        JpaSpecificationExecutor<Job> {

    List<Job> findByCompanyId(Long id);

    Long countByCompanyId(Long id);

    default Page<Job> findByCompanyId(
            Long id,
            Specification<Job> filterSpec,
            Pageable pageable
    ) {
        Specification<Job> userSpec = (root, q, cb) ->
                cb.equal(root.get("company").get("id"), id);

        Specification<Job> combined = userSpec.and(filterSpec);

        return findAll(combined, pageable);
    }

    List<Job> findDistinctTop3BySkills_NameInOrderByCreatedAtDesc(List<String> skillNames);

//    @Query("SELECT COUNT(j) FROM Job j WHERE j.active = true AND j.endDate > :atTime")
//    long countActiveJobs(@Param("atTime") Instant atTime);
//
//    // Các method khác
//    long countByCreatedAtBetween(Instant start, Instant end);
//
//    @Query("SELECT COUNT(j) FROM Job j WHERE j.createdAt BETWEEN :start AND :end AND j.active = true")
//    long countByCreatedAtBetweenAndActiveTrue(@Param("start") Instant start, @Param("end") Instant end);
//
//
//    Long countByEndDateAfter(LocalDateTime date);
//    Long countByEndDateBefore(LocalDateTime date);
//    Long countByCreatedAtAfter(LocalDateTime date);
//    Long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
//    Long countByLevel(String level);
//
//    @Query("SELECT j.id, j.name, c.name, COUNT(r) " +
//            "FROM Job j JOIN j.company c JOIN Resume r ON r.job.id = j.id " +
//            "GROUP BY j.id, j.name, c.name " +
//            "ORDER BY COUNT(r) DESC")
//    List<Object[]> findTopJobsByResumeCount(int limit);
}