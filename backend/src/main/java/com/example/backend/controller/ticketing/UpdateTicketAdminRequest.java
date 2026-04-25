package com.example.backend.controller.ticketing;

import lombok.Data;

@Data
public class UpdateTicketAdminRequest {
    private String status;
    private String assignedTechnician;
    private String rejectionReason;
}
