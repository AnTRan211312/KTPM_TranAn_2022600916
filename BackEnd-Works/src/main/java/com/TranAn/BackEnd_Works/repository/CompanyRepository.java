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
//    long countByCreatedAtBetween(Instant start, Instant end);
//
//
//    Long countByCreatedAtAfter(LocalDateTime date);
//
//    @Query("SELECT COUNT(DISTINCT c) FROM Company c JOIN Job j ON j.company.id = c.id WHERE j.endDate > :now")
//    Long countCompaniesWithActiveJobs(@Param("now") LocalDateTime now);
//
//    @Query("SELECT c.id, c.name, COUNT(j) " +
//            "FROM Company c LEFT JOIN Job j ON j.company.id = c.id " +
//            "GROUP BY c.id, c.name " +
//            "ORDER BY COUNT(j) DESC")
//    List<Object[]> findTopCompaniesByJobCount(int limit);
//
//    @Query("SELECT c.id, c.name, COUNT(r) " +
//            "FROM Company c JOIN Job j ON j.company.id = c.id JOIN Resume r ON r.job.id = j.id " +
//            "GROUP BY c.id, c.name " +
//            "ORDER BY COUNT(r) DESC")
//    List<Object[]> findTopCompaniesByResumeCount(int limit);
}
