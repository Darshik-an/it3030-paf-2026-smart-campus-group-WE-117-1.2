package com.example.backend.controller.ticketing;

import com.example.backend.model.ticketing.Ticket;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class TicketResponse {
    private Long id;
    private String resource;
    private String category;
    private String priority;
    private String description;
    private String status;
    private String assignedTechnician;
    private String rejectionReason;
    private String reporterName;
    private String reporterEmail;
    private List<String> images;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TicketResponse from(Ticket ticket) {
        return TicketResponse.builder()
                .id(ticket.getId())
                .resource(ticket.getResource())
                .category(ticket.getCategory().name())
                .priority(ticket.getPriority().name())
                .description(ticket.getDescription())
                .status(ticket.getStatus().name())
                .assignedTechnician(ticket.getAssignedTechnician())
                .rejectionReason(ticket.getRejectionReason())
                .reporterName(ticket.getUser() != null ? ticket.getUser().getName() : null)
                .reporterEmail(ticket.getUser() != null ? ticket.getUser().getEmail() : null)
                .images(ticket.getImages())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }
}
