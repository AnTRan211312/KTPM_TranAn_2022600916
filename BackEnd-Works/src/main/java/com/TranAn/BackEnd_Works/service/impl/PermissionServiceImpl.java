package com.TranAn.BackEnd_Works.service.impl;

import com.TranAn.BackEnd_Works.dto.request.permission.DefaultPermissionRequestDto;
import com.TranAn.BackEnd_Works.dto.response.permission.DefaultPermissionResponseDto;
import com.TranAn.BackEnd_Works.model.Permission;
import com.TranAn.BackEnd_Works.repository.PermissionRepository;
import com.TranAn.BackEnd_Works.repository.RoleRepository;
import com.TranAn.BackEnd_Works.service.PermissionService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    @Override
    public Page<DefaultPermissionResponseDto> findAllPermission(Specification<Permission> spec, Pageable pageable) {
        return permissionRepository
                .findAll(spec,pageable)
                .map(this::mapToDefaultResponseDto);
    }

    @Override
    public DefaultPermissionResponseDto savePermission(DefaultPermissionRequestDto defaultPermissionRequestDto) {
        Permission permission = new Permission(
                defaultPermissionRequestDto.getName(),
                defaultPermissionRequestDto.getApiPath(),
                defaultPermissionRequestDto.getMethod(),
                defaultPermissionRequestDto.getModule()
        );
        Permission savedPermission = permissionRepository.save(permission);
        return mapToDefaultResponseDto(savedPermission);
    }

    @Override
    public DefaultPermissionResponseDto updatePermission(Long id, DefaultPermissionRequestDto defaultPermissionRequestDto) {
        Permission permission = permissionRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("không tìm hấy quyền hạn này"));
        permission.setName(defaultPermissionRequestDto.getName());
        permission.setApiPath(defaultPermissionRequestDto.getApiPath());
        permission.setMethod(defaultPermissionRequestDto.getMethod());
        permission.setModule(defaultPermissionRequestDto.getModule());

        Permission savedPermission = permissionRepository.save(permission);
        return mapToDefaultResponseDto(savedPermission);
    }

    @Override
    public DefaultPermissionResponseDto deletePermission(Long id) {
        Permission permission = permissionRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy quyền hạn này"));

        permission.getRoles().forEach(role -> {
            role.getPermissions().remove(permission);
            roleRepository.saveAndFlush(role);
        });

        permissionRepository.delete(permission);
        return mapToDefaultResponseDto(permission);
    }

    private DefaultPermissionResponseDto mapToDefaultResponseDto(Permission permission) {

        DefaultPermissionResponseDto res = new DefaultPermissionResponseDto(
                permission.getId(),
                permission.getName(),
                permission.getApiPath(),
                permission.getMethod(),
                permission.getModule(),
                permission.getCreatedAt().toString(),
                permission.getUpdatedAt().toString()
        );

        return res;
    }
}
