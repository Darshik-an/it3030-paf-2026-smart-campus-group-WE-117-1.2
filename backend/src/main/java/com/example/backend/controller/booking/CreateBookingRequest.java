package com.example.backend.controller.booking;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import com.fasterxml.jackson.annotation.JsonFormat;

@Data
public class CreateBookingRequest {
    private Long resourceId;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate bookingDate;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;
    
    private String purpose;
    private Integer expectedAttendees;
}
