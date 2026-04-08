package com.TranAn.BackEnd_Works.service.impl;

import com.TranAn.BackEnd_Works.advice.exception.ResourceAlreadyExistsException;
import com.TranAn.BackEnd_Works.dto.request.skill.CreateSkillRequestDto;
import com.TranAn.BackEnd_Works.dto.response.skill.DefaultSkillResponseDto;
import com.TranAn.BackEnd_Works.dto.response.skill.UpdateSkillResponseDto;
import com.TranAn.BackEnd_Works.model.Skill;
import com.TranAn.BackEnd_Works.repository.SkillRepository;
import com.TranAn.BackEnd_Works.service.SkillService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class SkillServiceImpl implements SkillService {

    private final SkillRepository skillRepository;

    @Override
    @CacheEvict(value = "skills", allEntries = true)
    public DefaultSkillResponseDto saveSkill(CreateSkillRequestDto createSkillRequestDto) {

        if (skillRepository.existsByName(createSkillRequestDto.getName())) {
            throw new ResourceAlreadyExistsException("kỹ năng đã tồn tại");
        }

        Skill skill = new Skill();
        skill.setName(createSkillRequestDto.getName());
        Skill savedSkill = skillRepository.saveAndFlush(skill);
        return mapToDefaultSkillResponseDto(savedSkill);
    }

    @Override
    public Page<DefaultSkillResponseDto> findAllSkills(Specification<Skill> spec, Pageable pageable) {

        return skillRepository
                .findAll(spec, pageable)
                .map(this::mapToDefaultSkillResponseDto);
    }

    @Override
    @Cacheable(value = "skills", key = "#id")
    public DefaultSkillResponseDto findSkillById(Long id) {
        return skillRepository
                .findById(id)
                .map(this::mapToDefaultSkillResponseDto)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy kĩ năng"));
    }

    @Override
    @CacheEvict(value = "skills", allEntries = true)
    public DefaultSkillResponseDto updateSkillById(UpdateSkillResponseDto updateSkillResponseDto) {

        Skill skill = skillRepository
                .findById(updateSkillResponseDto.getId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy kỹ năng"));

        if (skillRepository.existsByNameAndIdNot(updateSkillResponseDto.getName(), updateSkillResponseDto.getId()))
            throw new ResourceAlreadyExistsException("Kỹ năng này đã tồn tại");

        skill.setName(updateSkillResponseDto.getName());
        Skill savedSkill = skillRepository.saveAndFlush(skill);

        return mapToDefaultSkillResponseDto(savedSkill);
    }

    @Override
    @CacheEvict(value = "skills", allEntries = true)
    public DefaultSkillResponseDto deleteSkillById(Long id) {
        Skill skill = skillRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy kỹ năng"));

        skillRepository.delete(skill);

        return mapToDefaultSkillResponseDto(skill);
    }

    private DefaultSkillResponseDto mapToDefaultSkillResponseDto(Skill skill) {
        return new DefaultSkillResponseDto(
                skill.getId(),
                skill.getName(),
                skill.getCreatedAt().toString(),
                skill.getUpdatedAt().toString());
    }
}
