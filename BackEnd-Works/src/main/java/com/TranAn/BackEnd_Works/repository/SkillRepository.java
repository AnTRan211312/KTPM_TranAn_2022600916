package com.TranAn.BackEnd_Works.repository;


import com.TranAn.BackEnd_Works.model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillRepository extends
        JpaRepository<Skill, Long>,
        JpaSpecificationExecutor<Skill> {

    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Long id);

//    @Query("SELECT s.name, COUNT(j) " +
//            "FROM Skill s JOIN s.jobs j " +
//            "GROUP BY s.name " +
//            "ORDER BY COUNT(j) DESC")
//    List<Object[]> findTopSkillsByJobCount(int limit);

}
