package com.TranAn.BackEnd_Works.repository;

import com.TranAn.BackEnd_Works.model.ChatMessage;
import com.TranAn.BackEnd_Works.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // Lấy tất cả message của một session
    List<ChatMessage> findByUserAndSessionIdOrderByCreatedAtAsc(User user, String sessionId);

    // Lấy N message gần nhất (để giới hạn context)
    @Query("SELECT cm FROM ChatMessage cm " +
            "WHERE cm.user = :user AND cm.sessionId = :sessionId " +
            "ORDER BY cm.createdAt DESC")
    List<ChatMessage> findTopNByUserAndSessionId(
            @Param("user") User user,
            @Param("sessionId") String sessionId
    );

    // Xóa toàn bộ chat của một session
    void deleteByUserAndSessionId(User user, String sessionId);

    // Đếm số message trong session
    long countByUserAndSessionId(User user, String sessionId);

    // Kiểm tra session có tồn tại không
    boolean existsByUserAndSessionId(User user, String sessionId);

    // ✨ MỚI: Lấy message đầu tiên của session
    Optional<ChatMessage> findFirstByUserAndSessionIdOrderByCreatedAtAsc(User user, String sessionId);

    // ✨ MỚI: Lấy message cuối cùng của session
    Optional<ChatMessage> findFirstByUserAndSessionIdOrderByCreatedAtDesc(User user, String sessionId);

    // ✨ MỚI: Lấy tất cả sessionId của user (DISTINCT) - sắp xếp theo thời gian message cuối cùng
    @Query("SELECT cm.sessionId FROM ChatMessage cm WHERE cm.user = :user " +
           "GROUP BY cm.sessionId ORDER BY MAX(cm.createdAt) DESC")
    List<String> findDistinctSessionIdsByUser(@Param("user") User user);
}