package com.TranAn.BackEnd_Works.service.impl;

import com.TranAn.BackEnd_Works.dto.request.user.SelfUserUpdatePasswordRequestDto;
import com.TranAn.BackEnd_Works.dto.request.user.SelfUserUpdateProfileRequestDto;
import com.TranAn.BackEnd_Works.dto.request.user.UserCreateRequestDto;
import com.TranAn.BackEnd_Works.dto.request.user.UserUpdateRequestDto;
import com.TranAn.BackEnd_Works.dto.response.user.DefaultUserResponseDto;
import com.TranAn.BackEnd_Works.model.Company;
import com.TranAn.BackEnd_Works.model.Resume;
import com.TranAn.BackEnd_Works.model.Role;
import com.TranAn.BackEnd_Works.model.User;
import com.TranAn.BackEnd_Works.repository.CompanyRepository;
import com.TranAn.BackEnd_Works.repository.RoleRepository;
import com.TranAn.BackEnd_Works.repository.UserRepository;
import com.TranAn.BackEnd_Works.service.S3Service;
import com.TranAn.BackEnd_Works.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final RoleRepository roleRepository;
    private final S3Service s3Service;
    private final PasswordEncoder passwordEncoder;

    @Override
    public DefaultUserResponseDto saveUser(UserCreateRequestDto userCreateRequestDto) {
       if(userRepository.existsByEmail(userCreateRequestDto.getEmail())) {
           throw new DataIntegrityViolationException("Email đã tồn tại");
       }
        User user = new User(
                userCreateRequestDto.getEmail().trim(),
                userCreateRequestDto.getName(),
                passwordEncoder.encode(userCreateRequestDto.getPassword().trim()),
                userCreateRequestDto.getDob(),
                userCreateRequestDto.getAddress(),
                userCreateRequestDto.getGender()
        );
       if(userCreateRequestDto.getCompany() != null) {
           handleSetCompany(user,userCreateRequestDto.getCompany().getId());
       }
       if(userCreateRequestDto.getRole() != null) {
           handleSetRole(user,userCreateRequestDto.getRole().getId());
       }
       User savedUser = userRepository.saveAndFlush(user);
       return mapToResponseDto(savedUser);
    }

    @Override
    public Page<DefaultUserResponseDto> findAllUser(Specification<User> spec, Pageable pageable) {

        return userRepository
                .findAll(spec,pageable)
                .map(this::mapToResponseDto);
    }
    @Override
    public DefaultUserResponseDto findUserById(Long id) {
        return userRepository
                .findById(id)
                .map(this::mapToResponseDto)
                .orElseThrow(() ->
                        new EntityNotFoundException("không tìm thấy người dùng")
                );
    }
    @Override
    public DefaultUserResponseDto updateUser(UserUpdateRequestDto userUpdateRequestDto) {
        User user = userRepository.findById(userUpdateRequestDto.getId())
                .orElseThrow(() -> new EntityNotFoundException("không tìm thấy người dùng"));
        user.setName(userUpdateRequestDto.getName());
        user.setDob(userUpdateRequestDto.getDob());
        user.setAddress(userUpdateRequestDto.getAddress());
        user.setGender(userUpdateRequestDto.getGender());
        if(userUpdateRequestDto.getCompany() != null) {
            Long companyId = userUpdateRequestDto.getCompany().getId();
            if(companyId == -1) {
                user.setCompany(null);
            }else{
                handleSetCompany(user,companyId);
            }
        }

        if (userUpdateRequestDto.getRole() != null) {
            Long roleId = userUpdateRequestDto.getRole().getId();
            if (roleId == -1) user.setRole(null);
            else handleSetRole(user, roleId);
        }

        User savedUser = userRepository.save(user);
        return mapToResponseDto(savedUser);
    }

    @Override
    public DefaultUserResponseDto deleteUserById(Long id) {
        User user = userRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("không tìm thấy người dùng"));
        user.setRole(null);
        user.setCompany(null);
        Company company = companyRepository.findByOwnerEmail(user.getEmail());
        if (company != null) company.setOwner(null);

        List<Resume> resumes = user.getResumes();
        resumes.forEach(x -> s3Service.deleteFileByKey(x.getFileKey()));

        userRepository.delete(user);
        return mapToResponseDto(user);
    }

    @Override
    public User findByEmail(String email) {
        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("không tìm thấy người dùng"));
        return user;
    }

    @Override
    public DefaultUserResponseDto updateSelfUserProfile(SelfUserUpdateProfileRequestDto selfUserUpdateProfileRequestDto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = findByEmail(email);
        user.setName(selfUserUpdateProfileRequestDto.getName());
        user.setDob(selfUserUpdateProfileRequestDto.getDob());
        user.setAddress(selfUserUpdateProfileRequestDto.getAddress());
        user.setGender(selfUserUpdateProfileRequestDto.getGender());
        User savedUser = userRepository.save(user);
        return mapToResponseDto(savedUser);
    }

    @Override
    public DefaultUserResponseDto updateSelfUserPassword(SelfUserUpdatePasswordRequestDto selfUserUpdatePasswordRequestDto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = findByEmail(email);
        if(!passwordEncoder.matches(selfUserUpdatePasswordRequestDto.getOldPassword(), user.getPassword())) {
            throw new DataIntegrityViolationException("mật khẩu hiện tại không chính xac");
        }

        String encodedPassword = passwordEncoder.encode(selfUserUpdatePasswordRequestDto.getNewPassword());
        user.setPassword(encodedPassword);
        User savedUser = userRepository.saveAndFlush(user);
        return mapToResponseDto(savedUser);
    }

    @Override
    public void updateSelfUserAvatar(MultipartFile avatarFile) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = findByEmail(email);
        if(avatarFile != null  && !avatarFile.isEmpty()) {
            String url = s3Service.uploadFile(avatarFile,"avatar",user.getId().toString(),true);
            user.setLogoUrl(url);
        }
        user.setUpdatedAt(Instant.now());
        userRepository.saveAndFlush(user);

    }

    private DefaultUserResponseDto mapToResponseDto(User user) {
        DefaultUserResponseDto.CompanyInformationDto company = null;
        if(user.getCompany() != null) {
            company = new DefaultUserResponseDto.CompanyInformationDto(
                    user.getCompany().getId(),
                    user.getCompany().getName(),
                    user.getCompany().getAddress(),
                    (user.getCompany().getCompanyLogo() == null ? "" : user.getCompany().getCompanyLogo().getLogoUrl())
            );
        }

        DefaultUserResponseDto.RoleInformationDto role = null;
        if(user.getRole() != null) {
            role = new DefaultUserResponseDto.RoleInformationDto(
                    user.getRole().getId(),
                    user.getRole().getName(),
                    user.getRole().getDescription()
            );
        }
        return new DefaultUserResponseDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getDob(),
                user.getAddress(),
                user.getGender(),
                user.getLogoUrl(),
                company,
                role,
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
    private void handleSetCompany(User user, Long id) {
        Company company = companyRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy không công ty"));
        user.setCompany(company);
    }

    private void handleSetRole(User user, Long id) {
        Role role = roleRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy không chức vụ"));
        user.setRole(role);
    }


}
