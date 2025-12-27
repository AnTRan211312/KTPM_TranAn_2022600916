package com.TranAn.BackEnd_Works.service.impl;

import com.TranAn.BackEnd_Works.advice.exception.ResourceAlreadyExistsException;
import com.TranAn.BackEnd_Works.dto.request.subscriber.DefaultSubscriberRequestDto;
import com.TranAn.BackEnd_Works.dto.response.subcriber.DefaultSubscriberResponseDto;
import com.TranAn.BackEnd_Works.model.Skill;
import com.TranAn.BackEnd_Works.model.Subscriber;
import com.TranAn.BackEnd_Works.repository.SkillRepository;
import com.TranAn.BackEnd_Works.repository.SubscriberRepository;
import com.TranAn.BackEnd_Works.service.SubscriberService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;


@Service
@Transactional
@RequiredArgsConstructor
public class SubscriberServiceImpl implements SubscriberService {

    private final SubscriberRepository subscriberRepository;
    private final SkillRepository skillRepository;
    @Override
    public DefaultSubscriberResponseDto saveSelfsubcriber(DefaultSubscriberRequestDto defaultSubscriberRequestDto) throws ResourceAlreadyExistsException {
        if(getSelfSubscriber() != null)
            throw new ResourceAlreadyExistsException("Người dùng này đã đăng ký rồi");
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Subscriber subscriber = new Subscriber(email);
        if (defaultSubscriberRequestDto.getSkills() != null) {
            List<Long> skillIds = defaultSubscriberRequestDto
                    .getSkills()
                    .stream()
                    .map(DefaultSubscriberRequestDto.SkillId::getId)
                    .toList();
            List<Skill> skills = skillRepository.findAllById(skillIds);

            subscriber.setSkills(skills);
        } else subscriber.setSkills(Collections.emptyList());

        return mapToDefaultSubscriberResponseDto(subscriberRepository.saveAndFlush(subscriber));

    }

    @Override
    public DefaultSubscriberResponseDto findSelfsubscriber() {
        return mapToDefaultSubscriberResponseDto(getSelfSubscriber());
    }

    @Override
    public DefaultSubscriberResponseDto updateSelfSubscriber(
            DefaultSubscriberRequestDto defaultSubscriberRequestDto
    ) {
        Subscriber subscriber = getSelfSubscriber();

        if (subscriber == null)
            throw new EntityNotFoundException("Không tìm thấy đăng ký người dùng này");

        if (defaultSubscriberRequestDto.getSkills() != null) {
            subscriber.getSkills().clear();

            List<Long> skillIds = defaultSubscriberRequestDto
                    .getSkills()
                    .stream()
                    .map(DefaultSubscriberRequestDto.SkillId::getId)
                    .toList();
            List<Skill> skills = skillRepository.findAllById(skillIds);

            subscriber.setSkills(skills);
        } else subscriber.setSkills(Collections.emptyList());

        return mapToDefaultSubscriberResponseDto(subscriberRepository.saveAndFlush(subscriber));
    }

    @Override
    public void deleteSelfSubscriber() {
        Subscriber subscriber = getSelfSubscriber();

        if (subscriber == null)
            throw new EntityNotFoundException("Không tìm thấy đăng ký người dùng này");

        subscriber.setSkills(null);
        subscriberRepository.delete(subscriber);
    }

    private Subscriber getSelfSubscriber() {
        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
        return subscriberRepository
                .findByEmail(email)
                .orElse(null);
    }

    private DefaultSubscriberResponseDto mapToDefaultSubscriberResponseDto(Subscriber subscriber) {
        if (subscriber == null) {
            return null;
        }
        DefaultSubscriberResponseDto res = new DefaultSubscriberResponseDto(
                subscriber.getId(),
                subscriber.getEmail()
        );
        if (subscriber.getSkills() != null) {
            List<DefaultSubscriberResponseDto.SkillDto> skills = subscriber
                    .getSkills()
                    .stream()
                    .map(skill -> new DefaultSubscriberResponseDto.SkillDto(skill.getId(), skill.getName()))
                    .toList();
            res.setSkills(skills);
        } else res.setSkills(Collections.emptyList());
        return  res;
    }
}
