package com.example.backend.controller.auth;

import com.example.backend.model.NotificationType;
import com.example.backend.model.auth.User;
import com.example.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications/test")
@RequiredArgsConstructor
public class NotificationTestController {

    private final NotificationService notificationService;

    private Long extractUserId(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return user.getId();
    }

    @PostMapping("/seed")
    public ResponseEntity<Void> seedNotifications(Authentication authentication) {
        Long userId = extractUserId(authentication);
        
        notificationService.createNotification(userId, "Booking Approved", "Your facility booking for the main hall has been approved.", NotificationType.BOOKING_APPROVED, "BK-001");
        notificationService.createNotification(userId, "Ticket Updated", "A technician has started working on your maintenance ticket.", NotificationType.TICKET_STATUS_CHANGED, "TK-842");
        notificationService.createNotification(userId, "New Comment on Ticket", "Please provide additional details about the equipment issue.", NotificationType.TICKET_COMMENT, "TK-842");
        notificationService.createNotification(userId, "Booking Rejected", "Unfortunately, the computer lab is under maintenance.", NotificationType.BOOKING_REJECTED, "BK-002");
        notificationService.createNotification(userId, "System Maintenance", "The Smart Campus Hub will be down for maintenance this Sunday from 2 AM to 4 AM.", NotificationType.GENERAL, null);

        return ResponseEntity.ok().build();
    }
}
