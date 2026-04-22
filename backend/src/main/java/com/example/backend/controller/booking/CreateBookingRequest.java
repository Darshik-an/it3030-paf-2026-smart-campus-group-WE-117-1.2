package com.example.backend.controller.booking;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CreateBookingRequest {
    private Long resourceId;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private Integer expectedAttendees;
}
