package com.TranAn.BackEnd_Works.repository;

import com.TranAn.BackEnd_Works.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Lấy tất cả thông báo của user theo thời gian mới nhất
    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId, Pageable pageable);

    // Lấy thông báo chưa đọc của user
    Page<Notification> findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(Long recipientId, Pageable pageable);

    // Đếm số thông báo chưa đọc
    Long countByRecipientIdAndIsReadFalse(Long recipientId);

    // Đánh dấu tất cả là đã đọc
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipient.id = :recipientId AND n.isRead = false")
    int markAllAsReadByRecipientId(@Param("recipientId") Long recipientId);

    // Lấy top N thông báo mới nhất (cho dropdown trên header)
    List<Notification> findTop10ByRecipientIdOrderByCreatedAtDesc(Long recipientId);
}
