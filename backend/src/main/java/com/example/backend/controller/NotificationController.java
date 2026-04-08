package com.example.backend.controller;

import com.example.backend.model.Notification;
import com.example.backend.model.User;
import com.example.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    private Long extractUserId(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return user.getId();
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications(Authentication authentication) {
        return ResponseEntity.ok(notificationService.getUserNotifications(extractUserId(authentication)));
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(extractUserId(authentication))));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, Authentication authentication) {
        notificationService.markAsRead(id, extractUserId(authentication));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        notificationService.markAllAsRead(extractUserId(authentication));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id, Authentication authentication) {
        notificationService.deleteNotification(id, extractUserId(authentication));
        return ResponseEntity.ok().build();
    }
}
