package com.example.backend.controller.booking;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.example.backend.model.booking.Booking;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private Long userId;
    private String userName;
    private Long resourceId;
    private String resourceName;
    private String location;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private Integer expectedAttendees;
    private String status;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BookingResponse from(Booking booking) {
        return new BookingResponse(
            booking.getId(),
            booking.getUser().getId(),
            booking.getUser().getName(),
            booking.getResource().getId(),
            booking.getResource().getName(),
            booking.getResource().getLocation(),
            booking.getBookingDate(),
            booking.getStartTime(),
            booking.getEndTime(),
            booking.getPurpose(),
            booking.getExpectedAttendees(),
            booking.getStatus().toString(),
            booking.getRejectionReason(),
            booking.getCreatedAt(),
            booking.getUpdatedAt()
        );
    }
}
