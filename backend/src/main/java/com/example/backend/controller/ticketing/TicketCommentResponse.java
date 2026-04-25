package com.example.backend.controller.ticketing;

import com.example.backend.model.ticketing.TicketComment;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class TicketCommentResponse {
    Long id;
    String message;
    String authorName;
    String authorEmail;
    String authorRole;
    LocalDateTime createdAt;

    public static TicketCommentResponse from(TicketComment c) {
        return TicketCommentResponse.builder()
                .id(c.getId())
                .message(c.getMessage())
                .authorName(c.getAuthor() != null ? c.getAuthor().getName() : null)
                .authorEmail(c.getAuthor() != null ? c.getAuthor().getEmail() : null)
                .authorRole(c.getAuthor() != null && c.getAuthor().getRole() != null ? c.getAuthor().getRole().name() : null)
                .createdAt(c.getCreatedAt())
                .build();
    }
}

