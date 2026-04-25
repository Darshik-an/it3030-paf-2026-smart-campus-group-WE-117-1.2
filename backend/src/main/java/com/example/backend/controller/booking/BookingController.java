package com.example.backend.controller.booking;

import com.example.backend.model.auth.User;
import com.example.backend.model.booking.Booking;
import com.example.backend.repository.auth.UserRepository;
import com.example.backend.service.booking.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookingController {
    private final BookingService bookingService;
    private final UserRepository userRepository;
    private static final LocalTime BOOKING_START_TIME = LocalTime.of(8, 0);
    private static final LocalTime BOOKING_END_TIME = LocalTime.of(17, 30);

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * GET /api/bookings - Get all bookings for the current user
     */
    @GetMapping
    public ResponseEntity<?> getUserBookings(
        @RequestParam(required = false) String status
    ) {
        try {
            User user = getCurrentUser();
            List<Booking> bookings;

            if (user.getRole() != null && user.getRole().name().equals("ADMIN")) {
                if (status != null && !status.trim().isEmpty()) {
                    try {
                        Booking.BookingStatus bookingStatus = Booking.BookingStatus.valueOf(status.toUpperCase());
                        bookings = bookingService.getAllBookings().stream()
                            .filter(b -> b.getStatus() == bookingStatus)
                            .collect(Collectors.toList());
                    } catch (IllegalArgumentException e) {
                        return ResponseEntity.badRequest().body("Invalid booking status: " + status);
                    }
                } else {
                    bookings = bookingService.getAllBookings();
                }
            } else {
                if (status != null && !status.trim().isEmpty()) {
                    bookings = bookingService.getUserBookingsByStatus(user, status);
                } else {
                    bookings = bookingService.getUserBookings(user);
                }
            }

            List<BookingResponse> responses = bookings.stream()
                .map(BookingResponse::from)
                .collect(Collectors.toList());

            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    /**
     * GET /api/bookings/{id} - Get a specific booking
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Long id) {
        try {
            User user = getCurrentUser();
            Booking booking = bookingService.getBookingById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

            // Check if user owns the booking or is admin
            if (!booking.getUser().getId().equals(user.getId()) && user.getRole() != User.Role.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }

            return ResponseEntity.ok(BookingResponse.from(booking));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    /**
     * POST /api/bookings - Create a new booking
     */
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody CreateBookingRequest request) {
        try {
            // Validate request
            if (request.getResourceId() == null || request.getBookingDate() == null ||
                request.getStartTime() == null || request.getEndTime() == null ||
                request.getPurpose() == null || request.getExpectedAttendees() == null) {
                return ResponseEntity.badRequest().body("Missing required fields");
            }

            // Validate date and time range
            if (request.getBookingDate().isBefore(LocalDate.now())) {
                return ResponseEntity.badRequest().body("Booking date cannot be in the past");
            }

            if (!request.getStartTime().isBefore(request.getEndTime())) {
                return ResponseEntity.badRequest().body("Start time must be before end time");
            }

            if (request.getStartTime().isBefore(BOOKING_START_TIME) ||
                request.getEndTime().isAfter(BOOKING_END_TIME)) {
                return ResponseEntity.badRequest().body("Booking time must be between 08:00 and 17:30");
            }

            User user = getCurrentUser();
            Booking booking = bookingService.createBooking(
                user,
                request.getResourceId(),
                request.getBookingDate(),
                request.getStartTime(),
                request.getEndTime(),
                request.getPurpose(),
                request.getExpectedAttendees()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(BookingResponse.from(booking));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    /**
     * PATCH /api/bookings/{id} - Update booking status (approve/reject/cancel)
     */
    @PatchMapping("/{id}")
    public ResponseEntity<?> updateBookingStatus(
        @PathVariable Long id,
        @RequestBody UpdateBookingStatusRequest request
    ) {
        try {
            User user = getCurrentUser();

            // Only admins can approve/reject bookings
            if (request.getStatus() != null && 
                (request.getStatus().equals("APPROVED") || request.getStatus().equals("REJECTED")) &&
                user.getRole() != User.Role.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only admins can approve or reject bookings");
            }

            Booking booking = bookingService.updateBookingStatus(
                id,
                request.getStatus(),
                request.getRejectionReason()
            );

            return ResponseEntity.ok(BookingResponse.from(booking));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    /**
     * POST /api/bookings/{id}/attendance-code - Generate or fetch attendance QR code
     */
    @PostMapping("/{id}/attendance-code")
    public ResponseEntity<?> generateAttendanceCode(@PathVariable Long id) {
        try {
            User user = getCurrentUser();
            if (user.getRole() != User.Role.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only admins can generate attendance QR codes");
            }

            String attendanceCode = bookingService.generateAttendanceCode(id);

            Map<String, String> response = new HashMap<>();
            response.put("attendanceCode", attendanceCode);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    /**
     * POST /api/bookings/attendance/confirm - Confirm attendance using QR code
     */
    @PostMapping("/attendance/confirm")
    public ResponseEntity<?> confirmAttendance(@RequestBody ConfirmAttendanceRequest request) {
        try {
            if (request == null || request.getAttendanceCode() == null || request.getAttendanceCode().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Attendance code is required");
            }

            User user = getCurrentUser();
            Booking updatedBooking = bookingService.confirmAttendance(user, request.getAttendanceCode());
            return ResponseEntity.ok(BookingResponse.from(updatedBooking));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    /**
     * DELETE /api/bookings/{id} - Cancel a booking
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        try {
            User user = getCurrentUser();
            Booking booking = bookingService.cancelBooking(id, user);
            return ResponseEntity.ok(BookingResponse.from(booking));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    /**
     * PUT /api/bookings/{id} - Edit a pending booking owned by user
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> editBooking(
        @PathVariable Long id,
        @RequestBody UpdateBookingRequest request
    ) {
        try {
            if (request.getBookingDate() == null || request.getStartTime() == null ||
                request.getEndTime() == null || request.getPurpose() == null ||
                request.getExpectedAttendees() == null) {
                return ResponseEntity.badRequest().body("Missing required fields");
            }

            if (request.getExpectedAttendees() < 1) {
                return ResponseEntity.badRequest().body("Expected attendees must be at least 1");
            }

            if (request.getBookingDate().isBefore(LocalDate.now())) {
                return ResponseEntity.badRequest().body("Booking date cannot be in the past");
            }

            if (!request.getStartTime().isBefore(request.getEndTime())) {
                return ResponseEntity.badRequest().body("Start time must be before end time");
            }

            if (request.getStartTime().isBefore(BOOKING_START_TIME) ||
                request.getEndTime().isAfter(BOOKING_END_TIME)) {
                return ResponseEntity.badRequest().body("Booking time must be between 08:00 and 17:30");
            }

            User user = getCurrentUser();
            Booking booking = bookingService.editBooking(
                id,
                user,
                request.getBookingDate(),
                request.getStartTime(),
                request.getEndTime(),
                request.getPurpose().trim(),
                request.getExpectedAttendees()
            );

            return ResponseEntity.ok(BookingResponse.from(booking));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    /**
     * GET /api/bookings/check-conflict - Check if there's a booking conflict
     */
    @GetMapping("/check-conflict")
    public ResponseEntity<?> checkConflict(
        @RequestParam Long resourceId,
        @RequestParam String date,
        @RequestParam String startTime,
        @RequestParam String endTime
    ) {
        try {
            boolean hasConflict = bookingService.hasConflict(
                resourceId,
                java.time.LocalDate.parse(date),
                java.time.LocalTime.parse(startTime),
                java.time.LocalTime.parse(endTime)
            );

            Map<String, Boolean> response = new HashMap<>();
            response.put("hasConflict", hasConflict);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
