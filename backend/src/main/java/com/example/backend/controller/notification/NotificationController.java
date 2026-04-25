package com.example.backend.controller.notification;

import com.example.backend.dto.notification.NotificationResponse;
import com.example.backend.model.auth.User;
import com.example.backend.service.notification.NotificationService;
import com.example.backend.service.notification.NotificationSseBroadcaster;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationSseBroadcaster notificationSseBroadcaster;

    private Long extractUserId(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return user.getId();
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(Authentication authentication) {
        return ResponseEntity.ok(notificationService.getUserNotificationsDto(extractUserId(authentication)));
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<NotificationResponse>> getMyNotificationsPaged(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Boolean unreadOnly
    ) {
        return ResponseEntity.ok(notificationService.getUserNotificationsPage(
                extractUserId(authentication), page, size, unreadOnly));
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(Authentication authentication) {
        Long userId = extractUserId(authentication);
        SseEmitter emitter = notificationSseBroadcaster.register(userId);
        try {
            long unread = notificationService.getUnreadCount(userId);
            emitter.send(SseEmitter.event().data(Map.of("unreadCount", unread), MediaType.APPLICATION_JSON));
        } catch (Exception ignored) {
            emitter.complete();
        }
        return emitter;
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
