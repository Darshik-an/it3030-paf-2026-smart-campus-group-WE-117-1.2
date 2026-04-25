package com.example.backend.dto.notification;

import com.example.backend.model.notification.Notification;
import com.example.backend.model.notification.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private String detailMessage;
    private NotificationType type;
    private String referenceId;
    private String actionPath;
    private boolean read;
    private LocalDateTime createdAt;

    public static NotificationResponse from(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .detailMessage(n.getDetailMessage())
                .type(n.getType())
                .referenceId(n.getReferenceId())
                .actionPath(n.getActionPath())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
