package com.TranAn.BackEnd_Works.controller;

import com.TranAn.BackEnd_Works.annotation.ApiMessage;
import com.TranAn.BackEnd_Works.dto.request.skill.CreateSkillRequestDto;
import com.TranAn.BackEnd_Works.dto.response.PageResponseDto;
import com.TranAn.BackEnd_Works.dto.response.skill.DefaultSkillResponseDto;
import com.TranAn.BackEnd_Works.dto.response.skill.UpdateSkillResponseDto;
import com.TranAn.BackEnd_Works.model.Skill;
import com.TranAn.BackEnd_Works.service.SkillService;
import com.turkraft.springfilter.boot.Filter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Skill")
@RestController
@RequestMapping("/skills")
@RequiredArgsConstructor
public class SkillController {

        private final SkillService skillService;

        @PostMapping
        @ApiMessage(value = "Tạo skill")
        @PreAuthorize("hasAuthority('POST /skills')")
        @Operation(summary = "Tạo skill", description = "Yêu cầu quyền : <b>POST /skills</b>")
        public ResponseEntity<DefaultSkillResponseDto> saveSkill(
                        @Valid @RequestBody CreateSkillRequestDto createSkillRequestDto) {
                return ResponseEntity.ok(skillService.saveSkill(createSkillRequestDto));
        }

        @GetMapping
        @ApiMessage(value = "Lấy danh sách Skill")
        @PreAuthorize("hasAuthority('GET /skills') OR isAnonymous()")
        @Operation(summary = "Lấy danh sách Skill", description = "Yêu cầu quyền: <b>GET /skills</b>")
        @SecurityRequirements()
        public ResponseEntity<PageResponseDto<DefaultSkillResponseDto>> findAllSkills(
                        @Filter Specification<Skill> spec,
                        @PageableDefault(size = 5) Pageable pageable) {

                Page<DefaultSkillResponseDto> page = skillService.findAllSkills(spec, pageable);

                PageResponseDto<DefaultSkillResponseDto> res = new PageResponseDto<>(
                                page.getContent(),
                                pageable.getPageNumber() + 1,
                                pageable.getPageSize(),
                                page.getTotalElements(),
                                page.getTotalPages());

                return ResponseEntity.ok(res);
        }

        @GetMapping("/{id}")
        @ApiMessage(value = "Lấy Skill theo id")
        @PreAuthorize("hasAuthority('GET /skills/{id}') OR isAnonymous()")
        @Operation(summary = "Lấy Skill theo id", description = "Yêu cầu quyền: <b>GET /skills/{id}</b>")
        @SecurityRequirements()
        public ResponseEntity<DefaultSkillResponseDto> findSkillById(@PathVariable Long id) {
                return ResponseEntity.ok(skillService.findSkillById(id));
        }

        @PutMapping
        @ApiMessage(value = "Cập nhật Skill")
        @PreAuthorize("hasAuthority('PUT /skills')")
        @Operation(summary = "Cập nhật Skill", description = "Yêu cầu quyền: <b>PUT /skills</b>")
        public ResponseEntity<DefaultSkillResponseDto> updateSkill(
                        @Valid @RequestBody UpdateSkillResponseDto updateSkillResponseDto) {
                return ResponseEntity.ok(skillService.updateSkillById(updateSkillResponseDto));

        }

        @DeleteMapping("/{id}")
        @ApiMessage(value = "Xóa Skill theo id")
        @PreAuthorize("hasAuthority('DELETE /skills/{id}')")
        @Operation(summary = "Xóa Skill theo id", description = "Yêu cầu quyền: <b>DELETE /skills/{id}</b>")
        public ResponseEntity<DefaultSkillResponseDto> deleteSkillById(@PathVariable Long id) {
                return ResponseEntity.ok(skillService.deleteSkillById(id));
        }
}
