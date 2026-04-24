package com.example.backend.service.booking;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.backend.model.Resource;
import com.example.backend.model.auth.User;
import com.example.backend.model.booking.Booking;
import com.example.backend.repository.ResourceRepository;
import com.example.backend.repository.booking.BookingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private static final LocalTime BOOKING_START_TIME = LocalTime.of(8, 0);
    private static final LocalTime BOOKING_END_TIME = LocalTime.of(17, 30);

    /**
     * Create a new booking after checking for conflicts
     */
    public Booking createBooking(User user, Long resourceId, LocalDate bookingDate, 
                                LocalTime startTime, LocalTime endTime, String purpose, 
                                Integer expectedAttendees) {
        validateBookingDateAndTime(bookingDate, startTime, endTime);

        // Validate resource exists
        Resource resource = resourceRepository.findById(resourceId)
            .orElseThrow(() -> new RuntimeException("Resource not found"));

        // Check for conflicts
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
            resourceId, bookingDate, startTime, endTime
        );

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Time slot conflict: Resource is already booked for this time");
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setResource(resource);
        booking.setBookingDate(bookingDate);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setPurpose(purpose);
        booking.setExpectedAttendees(expectedAttendees);
        booking.setStatus(Booking.BookingStatus.PENDING);

        return bookingRepository.save(booking);
    }

    /**
     * Get all bookings for a user
     */
    public List<Booking> getUserBookings(User user) {
        return bookingRepository.findByUser(user);
    }

    /**
     * Get all bookings for a user with a specific status
     */
    public List<Booking> getUserBookingsByStatus(User user, String status) {
        try {
            Booking.BookingStatus bookingStatus = Booking.BookingStatus.valueOf(status);
            return bookingRepository.findByUserAndStatus(user, bookingStatus);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid booking status: " + status);
        }
    }

    /**
     * Get booking by ID
     */
    public Optional<Booking> getBookingById(Long id) {
        return bookingRepository.findById(id);
    }

    /**
     * Get all pending bookings (for admins)
     */
    public List<Booking> getPendingBookings() {
        return bookingRepository.findByStatus(Booking.BookingStatus.PENDING);
    }

    /**
     * Get all bookings (for admins)
     */
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    /**
     * Update booking status (approve/reject/cancel)
     */
    public Booking updateBookingStatus(Long bookingId, String status, String rejectionReason) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));

        try {
            Booking.BookingStatus newStatus = Booking.BookingStatus.valueOf(status);
            booking.setStatus(newStatus);

            if (newStatus == Booking.BookingStatus.REJECTED && rejectionReason != null) {
                booking.setRejectionReason(rejectionReason);
            }

            return bookingRepository.save(booking);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid booking status: " + status);
        }
    }

    /**
     * Cancel a booking (user can only cancel approved bookings)
     */
    public Booking cancelBooking(Long bookingId, User user) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Verify user owns the booking
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: You can only cancel your own bookings");
        }

        // Can only cancel approved bookings
        if (booking.getStatus() != Booking.BookingStatus.APPROVED) {
            throw new RuntimeException("Only approved bookings can be cancelled");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    /**
     * Edit a booking owned by current user.
     */
    public Booking editBooking(Long bookingId, User user, LocalDate bookingDate,
                               LocalTime startTime, LocalTime endTime, String purpose,
                               Integer expectedAttendees) {
        validateBookingDateAndTime(bookingDate, startTime, endTime);

        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: You can only edit your own bookings");
        }

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new RuntimeException("Only pending bookings can be edited");
        }

        boolean hasConflict = hasConflictExcluding(
            booking.getResource().getId(),
            bookingDate,
            startTime,
            endTime,
            booking.getId()
        );
        if (hasConflict) {
            throw new RuntimeException("Time slot conflict: Resource is already booked for this time");
        }

        booking.setBookingDate(bookingDate);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setPurpose(purpose);
        booking.setExpectedAttendees(expectedAttendees);

        return bookingRepository.save(booking);
    }

    private void validateBookingDateAndTime(LocalDate bookingDate, LocalTime startTime, LocalTime endTime) {
        if (bookingDate.isBefore(LocalDate.now())) {
            throw new RuntimeException("Booking date cannot be in the past");
        }

        if (!startTime.isBefore(endTime)) {
            throw new RuntimeException("Start time must be before end time");
        }

        if (startTime.isBefore(BOOKING_START_TIME) || endTime.isAfter(BOOKING_END_TIME)) {
            throw new RuntimeException("Booking time must be between 08:00 and 17:30");
        }
    }

    /**
     * Check for booking conflicts for a time slot
     */
    public boolean hasConflict(Long resourceId, LocalDate bookingDate, LocalTime startTime, LocalTime endTime) {
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
            resourceId, bookingDate, startTime, endTime
        );
        return !conflicts.isEmpty();
    }

    /**
     * Check for booking conflicts excluding a specific booking (for updates)
     */
    public boolean hasConflictExcluding(Long resourceId, LocalDate bookingDate, LocalTime startTime, 
                                       LocalTime endTime, Long bookingId) {
        List<Booking> conflicts = bookingRepository.findConflictingBookingsExcluding(
            resourceId, bookingDate, startTime, endTime, bookingId
        );
        return !conflicts.isEmpty();
    }
}
