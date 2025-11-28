package com.TranAn.BackEnd_Works.service.impl;

import com.TranAn.BackEnd_Works.advice.exception.ResourceAlreadyExistsException;
import com.TranAn.BackEnd_Works.dto.request.company.DefaultCompanyRequestDto;
import com.TranAn.BackEnd_Works.dto.request.user.RecruiterRequestDto;
import com.TranAn.BackEnd_Works.dto.response.company.DefaultCompanyExtendedResponseDto;
import com.TranAn.BackEnd_Works.dto.response.company.DefaultCompanyResponseDto;
import com.TranAn.BackEnd_Works.dto.response.user.RecruiterResponseDto;
import com.TranAn.BackEnd_Works.model.Company;
import com.TranAn.BackEnd_Works.model.CompanyLogo;
import com.TranAn.BackEnd_Works.model.User;
import com.TranAn.BackEnd_Works.repository.CompanyLogoRepository;
import com.TranAn.BackEnd_Works.repository.CompanyRepository;
import com.TranAn.BackEnd_Works.repository.JobRepository;
import com.TranAn.BackEnd_Works.repository.UserRepository;
import com.TranAn.BackEnd_Works.service.CompanyService;
import com.TranAn.BackEnd_Works.service.JobService;
import com.TranAn.BackEnd_Works.service.S3Service;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Objects;


@Service
@RequiredArgsConstructor
@Transactional
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final CompanyLogoRepository companyLogoRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    private final S3Service s3Service;
    private final JobService jobService;

    @Override
    public DefaultCompanyResponseDto saveCompany(
            DefaultCompanyRequestDto dto,
            MultipartFile logoFile,
            boolean isRecruiter
    ) {
        Company company = new Company(dto.getName(), dto.getDescription(), dto.getAddress());
        Company savedCompany = companyRepository.saveAndFlush(company);

        if (isRecruiter) {
            String email = SecurityContextHolder
                    .getContext()
                    .getAuthentication()
                    .getName();

            User user = userRepository
                    .findByEmail(email)
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));

            if (user.getCompany() != null)
                throw new ResourceAlreadyExistsException("Người dùng đã có công ty");

            user.setCompany(savedCompany);
            userRepository.saveAndFlush(user);

            savedCompany.setOwner(user);
        }

        if (logoFile != null && !logoFile.isEmpty()) {

            String url = s3Service.uploadFile(logoFile, "company-logos", company.getId().toString(), true);

            CompanyLogo logo = new CompanyLogo();
            logo.setCompany(savedCompany);
            logo.setLogoUrl(url);

            CompanyLogo savedLogo = companyLogoRepository.save(logo);
            savedCompany.setCompanyLogo(savedLogo);

            companyRepository.saveAndFlush(savedCompany);
        }

        return mapToResponseDto(savedCompany);
    }

    @Override
    public DefaultCompanyResponseDto updateCompany(
            DefaultCompanyRequestDto dto,
            Long id,
            MultipartFile logoFile,
            boolean isRecruiter
    ) {
        Company company;

        if (isRecruiter) {
            String email = SecurityContextHolder
                    .getContext()
                    .getAuthentication()
                    .getName();

            User user = userRepository
                    .findByEmail(email)
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));

            if (user.getCompany() == null)
                throw new EntityNotFoundException("Không tìm thấy công ty người dùng");

            company = user.getCompany();
        } else
            company = companyRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Không tìm thấy công ty"));

        company.setName(dto.getName());
        company.setDescription(dto.getDescription());
        company.setAddress(dto.getAddress());

        if (logoFile != null && !logoFile.isEmpty()) {
            String url = s3Service.uploadFile(logoFile, "company-logos", company.getId().toString(), true);

            CompanyLogo logo = company.getCompanyLogo();
            if (logo == null) {
                logo = new CompanyLogo();
                logo.setCompany(company);
                company.setCompanyLogo(logo);
            }
            logo.setLogoUrl(url);
        }

        return mapToResponseDto(companyRepository.saveAndFlush(company));
    }

    @Override
    public Page<DefaultCompanyResponseDto> findAllCompanies(Specification<Company> spec, Pageable pageable) {
        return companyRepository.findAll(spec, pageable)
                .map(this::mapToResponseDto);
    }

    @Override
    public Page<DefaultCompanyExtendedResponseDto> findAllCompaniesWithJobsCount(Specification<Company> spec, Pageable pageable) {
        return companyRepository.findAll(spec, pageable)
                .map(this::mapToExtendedResponseDto);
    }

    @Override
    public DefaultCompanyResponseDto findCompanyById(Long id) {
        return companyRepository.findById(id)
                .map(this::mapToResponseDto)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy công ty"));
    }

    @Override
    public DefaultCompanyResponseDto findSelfCompany() {
        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));

        if (user.getCompany() == null)
            throw new EntityNotFoundException("Không tìm thấy công ty người dùng");

        return mapToResponseDto(user.getCompany());
    }

    @Override
    public List<RecruiterResponseDto> findAllRecruitersBySelfCompany() {
        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));

        if (user.getCompany() == null)
            throw new EntityNotFoundException("Người dùng không có công ty");

        List<User> recruiterList = userRepository
                .findByCompanyId(user.getCompany().getId());

        Long ownerId;
        if (user.getCompany().getOwner() != null)
            ownerId = user.getCompany().getOwner().getId();
        else
            ownerId = null;

        return recruiterList
                .stream()
                .map(x -> {
                    boolean isOwner = Objects.equals(x.getId(), ownerId);

                    return new RecruiterResponseDto(x.getId(), x.getName(), x.getEmail(), isOwner);
                })
                .toList();
    }

    @Override
    public void addMemberToCompany(RecruiterRequestDto recruiterRequestDto) {
        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));

        if (user.getCompany() == null)
            throw new EntityNotFoundException("Người dùng không có công ty");

        Company company = companyRepository
                .findById(user.getCompany().getId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy công ty người dùng"));

        String emailRecruiter = recruiterRequestDto.getEmail();
        User recruiter = userRepository
                .findByEmail(emailRecruiter)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng cần thêm"));

        if (recruiter.getCompany() != null)
            throw new EntityNotFoundException("Người dùng cần thêm đã có công ty");

        recruiter.setCompany(company);
        userRepository.saveAndFlush(recruiter);
    }

    @Override
    public void removeMemberFromCompany(RecruiterRequestDto recruiterRequestDto) {
        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));

        if (user.getCompany() == null)
            throw new EntityNotFoundException("Người dùng không có công ty");

        if (user.getCompany().getOwner() == null || 
            !Objects.equals(user.getCompany().getOwner().getId(), user.getId()))
            throw new AccessDeniedException("Không có quyền truy cập");

        String emailRecruiter = recruiterRequestDto.getEmail();
        User recruiter = userRepository
                .findByEmail(emailRecruiter)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng cần loại bỏ"));

        if (recruiter.getCompany() == null)
            throw new EntityNotFoundException("Người dùng cần loại bỏ không có công ty");

        if (!Objects.equals(recruiter.getCompany().getId(), user.getCompany().getId()))
            throw new EntityNotFoundException("Người dùng này thuộc công ty khác");

        recruiter.setCompany(null);
        userRepository.saveAndFlush(recruiter);
    }

    @Override
    public DefaultCompanyResponseDto deleteCompanyById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy công ty"));

        // 1. Detach users from company
        userRepository.detachUsersFromCompany(company);

        // 2. Set owner to null để tránh constraint violation
        if (company.getOwner() != null) {
            User owner = company.getOwner();
            owner.setCompany(null);
            userRepository.save(owner);
        }

        // 3. Xóa logo
        if (company.getCompanyLogo() != null) {
            String logoUrl = company.getCompanyLogo().getLogoUrl();
            s3Service.deleteFileByUrl(logoUrl);
            companyLogoRepository.delete(company.getCompanyLogo());
        }

        // 4. QUAN TRỌNG: Set company = null cho tất cả jobs TRƯỚC khi xóa
        // Điều này tránh TransientObjectException khi JobService.saveAndFlush()
        if (company.getJobs() != null && !company.getJobs().isEmpty()) {
            company.getJobs().forEach(job -> {
                job.setCompany(null);
                jobRepository.save(job); // Save để detach relationship
            });
            // Sau đó mới xóa jobs (sẽ cleanup resumes và skills)
            company.getJobs().forEach(job -> jobService.deleteJobById(job.getId()));
        }

        // 5. Cuối cùng mới xóa company
        companyRepository.delete(company);
        return mapToResponseDto(company);
    }

    private DefaultCompanyResponseDto mapToResponseDto(Company company) {
        String logoUrl = null;

        if (company.getCompanyLogo() != null)
            logoUrl = company.getCompanyLogo().getLogoUrl();


        return new DefaultCompanyResponseDto(
                company.getId(),
                company.getName(),
                company.getDescription(),
                company.getAddress(),
                logoUrl,
                company.getCreatedAt().toString(),
                company.getUpdatedAt().toString()
        );
    }

    private DefaultCompanyExtendedResponseDto mapToExtendedResponseDto(Company company) {
        String logoUrl = null;

        if (company.getCompanyLogo() != null)
            logoUrl = company.getCompanyLogo().getLogoUrl();

        Long jobsCount = jobRepository.countByCompanyId(company.getId());


        return new DefaultCompanyExtendedResponseDto(
                company.getId(),
                company.getName(),
                company.getDescription(),
                company.getAddress(),
                logoUrl,
                company.getCreatedAt().toString(),
                company.getUpdatedAt().toString(),
                jobsCount
        );
    }
}

