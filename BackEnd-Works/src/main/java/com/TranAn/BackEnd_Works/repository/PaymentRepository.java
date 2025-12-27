package com.TranAn.BackEnd_Works.repository;

import com.TranAn.BackEnd_Works.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByOrderId(String orderId);

    Optional<Payment> findByUserIdAndJobIdAndPaymentStatus(Long userId, Long jobId, Payment.PaymentStatus status);

    boolean existsByUserIdAndJobIdAndPaymentStatus(Long userId, Long jobId, Payment.PaymentStatus status);
}
