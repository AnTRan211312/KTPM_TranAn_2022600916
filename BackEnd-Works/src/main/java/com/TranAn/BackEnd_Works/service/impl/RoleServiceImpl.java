package com.TranAn.BackEnd_Works.service.impl;

import com.TranAn.BackEnd_Works.dto.request.role.DefaultRoleRequestDto;
import com.TranAn.BackEnd_Works.dto.response.role.DefaultRoleResponseDto;
import com.TranAn.BackEnd_Works.model.Permission;
import com.TranAn.BackEnd_Works.model.Role;
import com.TranAn.BackEnd_Works.repository.PermissionRepository;
import com.TranAn.BackEnd_Works.repository.RoleRepository;
import com.TranAn.BackEnd_Works.repository.UserRepository;
import com.TranAn.BackEnd_Works.service.RoleService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;

    @Override
    public DefaultRoleResponseDto saveRole(DefaultRoleRequestDto defaultRoleRequestDto) {
        Role role = new Role(
                defaultRoleRequestDto.getName(),
                defaultRoleRequestDto.getDescription()
        );

        Set<Permission> permissions = null;
        if (defaultRoleRequestDto.getPermissions() != null) {
            Set<Long> permissionIds = defaultRoleRequestDto
                    .getPermissions()
                    .stream()
                    .map(DefaultRoleRequestDto.PermissionId::getId)
                    .collect(Collectors.toSet());
            permissions = new HashSet<>(permissionRepository.findAllById(permissionIds));

            if (permissions.size() != defaultRoleRequestDto.getPermissions().size())
                throw new EntityNotFoundException("Quyền hạn không tồn tại");
        }

        role.setPermissions(permissions);

        Role savedRole = roleRepository.save(role);
        return mapToDefaultRoleResponseDto(savedRole);
    }

    @Override
    public DefaultRoleResponseDto updateRole(
            Long id,
            DefaultRoleRequestDto defaultRoleRequestDto
    ) {
        Role role = roleRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Chức vụ không tồn tại"));

        String currentName = role.getName();
        if (
                currentName != null
                        && !currentName.equalsIgnoreCase("ADMIN")
                        && !currentName.equalsIgnoreCase("USER")
                        && !currentName.equalsIgnoreCase("RECRUITER")
        ) role.setName(defaultRoleRequestDto.getName());

        role.setDescription(defaultRoleRequestDto.getDescription());
        role.setActive(defaultRoleRequestDto.isActive());

        if (defaultRoleRequestDto.getPermissions() != null) {
            Set<Long> requestedPermissionIds = defaultRoleRequestDto.getPermissions().stream()
                    .map(DefaultRoleRequestDto.PermissionId::getId)
                    .collect(Collectors.toSet());

            Set<Permission> currentPermissions = new HashSet<>(role.getPermissions());
            currentPermissions.removeIf(x -> !requestedPermissionIds.contains(x.getId()));

            Set<Long> currentPermissionIds = currentPermissions.stream()
                    .map(Permission::getId)
                    .collect(Collectors.toSet());

            Set<Long> newPermissionIdsToAdd = new HashSet<>(requestedPermissionIds);
            requestedPermissionIds.removeAll(currentPermissionIds);

            if (!newPermissionIdsToAdd.isEmpty()) {
                List<Permission> newPermissions = permissionRepository.findAllById(newPermissionIdsToAdd);
                currentPermissions.addAll(newPermissions);
            }

            role.setPermissions(currentPermissions);
        }

        Role updatedRole = roleRepository.saveAndFlush(role);

        return mapToDefaultRoleResponseDto(updatedRole);
    }

    @Override
    public Page<DefaultRoleResponseDto> findAllRoles(
            Specification<Role> spec,
            Pageable pageable) {
        return roleRepository
                .findAll(spec, pageable)
                .map(this::mapToDefaultRoleResponseDto);
    }

    @Override
    public DefaultRoleResponseDto deleteRoleById(Long id) {
        Role role = roleRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Chức vụ không tồn tại"));

        String currentName = role.getName();
        if (
                currentName != null
                        && !currentName.equalsIgnoreCase("ADMIN")
                        && !currentName.equalsIgnoreCase("USER")
        ) {
            DefaultRoleResponseDto defaultRoleResponseDto = mapToDefaultRoleResponseDto(role);

            if (role.getPermissions() != null) role.getPermissions().clear();
            userRepository.detachUsersFromRole(role.getId());

            roleRepository.delete(role);
            return defaultRoleResponseDto;
        }

        throw new AccessDeniedException("Không thể xóa chức vụ mặc định");
    }

    private DefaultRoleResponseDto mapToDefaultRoleResponseDto(Role role) {
        DefaultRoleResponseDto res = new DefaultRoleResponseDto(
                role.getId(),
                role.isActive(),
                role.getName(),
                role.getCreatedAt().toString(),
                role.getUpdatedAt().toString(),
                role.getDescription()
        );

        List<DefaultRoleResponseDto.Permission> permissions = role.getPermissions()
                .stream()
                .map(p -> new DefaultRoleResponseDto.Permission(
                        p.getId(),
                        p.getName(),
                        p.getApiPath(),
                        p.getMethod(),
                        p.getModule()
                ))
                .toList();
        res.setPermissions(permissions);

        return res;
    }
}