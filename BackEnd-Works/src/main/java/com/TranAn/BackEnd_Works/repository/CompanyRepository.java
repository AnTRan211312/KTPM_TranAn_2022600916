package com.TranAn.BackEnd_Works.repository;

import com.TranAn.BackEnd_Works.model.Company;
import com.TranAn.BackEnd_Works.model.CompanyLogo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long>, JpaSpecificationExecutor<Company> {

        Company findByOwnerEmail(String email);

        @Query("SELECT COUNT(c) FROM Company c WHERE c.createdAt >= :start")
        Long countByCreatedAtAfter(@Param("start") Instant start);

        @Query("SELECT COUNT(DISTINCT c) FROM Company c JOIN c.jobs j WHERE j.endDate > :now AND j.status = 'ACTIVE'")
        Long countCompaniesWithActiveJobs(@Param("now") Instant now);

        @Query("SELECT c.id, c.name, COUNT(j) " +
                        "FROM Company c LEFT JOIN c.jobs j " +
                        "GROUP BY c.id, c.name " +
                        "ORDER BY COUNT(j) DESC")
        List<Object[]> findTopCompaniesByJobCount();

        @Query("SELECT c.id, c.name, COUNT(r) " +
                        "FROM Company c JOIN c.jobs j LEFT JOIN j.resumes r " +
                        "GROUP BY c.id, c.name " +
                        "ORDER BY COUNT(r) DESC")
        List<Object[]> findTopCompaniesByResumeCount();
}
