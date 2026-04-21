package com.example.backend.controller.booking;

import lombok.Data;

@Data
public class UpdateBookingStatusRequest {
    private String status;
    private String rejectionReason;
}
