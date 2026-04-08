package com.TranAn.BackEnd_Works.repository;

import com.TranAn.BackEnd_Works.model.Job;
import com.TranAn.BackEnd_Works.model.constant.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;

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
                        Pageable pageable) {
                Specification<Job> userSpec = (root, q, cb) -> cb.equal(root.get("company").get("id"), id);

                Specification<Job> combined = userSpec.and(filterSpec);

                return findAll(combined, pageable);
        }

        List<Job> findDistinctTop3BySkills_NameInOrderByCreatedAtDesc(List<String> skillNames);

        @Query("SELECT COUNT(j) FROM Job j WHERE j.status = 'ACTIVE' AND j.endDate > :atTime")
        Long countActiveJobs(@Param("atTime") Instant atTime);

        @Query("SELECT COUNT(j) FROM Job j WHERE j.createdAt >= :start")
        Long countByCreatedAtAfter(@Param("start") Instant start);

        @Query("SELECT COUNT(j) FROM Job j WHERE j.createdAt >= :start AND j.createdAt < :end")
        Long countByCreatedAtBetween(@Param("start") Instant start, @Param("end") Instant end);

        @Query("SELECT COUNT(j) FROM Job j WHERE j.endDate > :date")
        Long countByEndDateAfter(@Param("date") Instant date);

        @Query("SELECT COUNT(j) FROM Job j WHERE j.endDate <= :date")
        Long countByEndDateBefore(@Param("date") Instant date);

        @Query("SELECT COUNT(j) FROM Job j WHERE j.level = :level")
        Long countByLevel(@Param("level") com.TranAn.BackEnd_Works.model.constant.Level level);

        @Query("SELECT COUNT(j) FROM Job j WHERE j.level = :level AND j.company.id = :companyId")
        Long countByLevelAndCompanyId(@Param("level") com.TranAn.BackEnd_Works.model.constant.Level level,
                        @Param("companyId") Long companyId);

        @Query("SELECT j.id, j.name, c.name, COUNT(r) " +
                        "FROM Job j LEFT JOIN j.company c LEFT JOIN j.resumes r " +
                        "GROUP BY j.id, j.name, c.name " +
                        "ORDER BY COUNT(r) DESC")
        List<Object[]> findTopJobsByResumeCount();

        /**
         * Cập nhật hàng loạt trạng thái công việc đã hết hạn
         */
        @Modifying
        @Query("UPDATE Job j SET j.status = :newStatus WHERE j.status = :oldStatus AND j.endDate < :now")
        int updateExpiredJobs(@Param("oldStatus") JobStatus oldStatus,
                        @Param("newStatus") JobStatus newStatus,
                        @Param("now") Instant now);

        // ===== FIX N+1: EntityGraph & batch methods =====

        /** Override findAll từ JpaSpecificationExecutor — load kèm company, logo, skills trong 1 query. */
        @Override
        @EntityGraph(attributePaths = {"company", "company.companyLogo", "skills"})
        Page<Job> findAll(Specification<Job> spec, Pageable pageable);

        /** Load danh sách jobs theo companyId kèm đầy đủ relations — tránh N+1. */
        @EntityGraph(attributePaths = {"company", "company.companyLogo", "skills"})
        @Query("SELECT j FROM Job j WHERE j.company.id = :id")
        List<Job> findWithDetailsByCompanyId(@Param("id") Long id);

        /** Đếm job count cho nhiều companyId cùng lúc (1 query thay vì N). */
        @Query("SELECT j.company.id, COUNT(j) FROM Job j WHERE j.company.id IN :ids GROUP BY j.company.id")
        List<Object[]> countByCompanyIdIn(@Param("ids") List<Long> ids);

        /** Bulk SET company = null bằng 1 UPDATE — thay thế forEach(save()). */
        @Modifying
        @Query("UPDATE Job j SET j.company = null WHERE j.company.id = :companyId")
        void detachAllJobsFromCompany(@Param("companyId") Long companyId);

        /** Đếm jobs theo từng level trong 1 query GROUP BY — thay 5 countByLevel() riêng lẻ. */
        @Query("SELECT j.level, COUNT(j) FROM Job j GROUP BY j.level")
        List<Object[]> countGroupByLevel();

        /** Đếm jobs theo từng level của 1 company trong 1 query GROUP BY. */
        @Query("SELECT j.level, COUNT(j) FROM Job j WHERE j.company.id = :companyId GROUP BY j.level")
        List<Object[]> countGroupByLevelAndCompanyId(@Param("companyId") Long companyId);
}
