package com.example.backend.controller.booking;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class UpdateBookingRequest {
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate bookingDate;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    private String purpose;
    private Integer expectedAttendees;
}