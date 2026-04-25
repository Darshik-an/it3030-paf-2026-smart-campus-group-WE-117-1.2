package com.example.backend.repository.booking;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.backend.model.auth.User;
import com.example.backend.model.booking.Booking;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUser(User user);

    Optional<Booking> findByAttendanceCode(String attendanceCode);

    List<Booking> findByUserAndStatus(User user, Booking.BookingStatus status);

    List<Booking> findByStatus(Booking.BookingStatus status);

    // Check for conflicts: same resource, same date, overlapping time
    @Query("SELECT b FROM Booking b WHERE " +
           "b.resource.id = :resourceId AND " +
           "b.bookingDate = :bookingDate AND " +
           "b.status != 'CANCELLED' AND " +
           "NOT (b.endTime <= :startTime OR b.startTime >= :endTime)")
    List<Booking> findConflictingBookings(
        @Param("resourceId") Long resourceId,
        @Param("bookingDate") LocalDate bookingDate,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime
    );

    @Query("SELECT b FROM Booking b WHERE " +
           "b.resource.id = :resourceId AND " +
           "b.bookingDate = :bookingDate AND " +
           "b.id != :bookingId AND " +
           "b.status != 'CANCELLED' AND " +
           "NOT (b.endTime <= :startTime OR b.startTime >= :endTime)")
    List<Booking> findConflictingBookingsExcluding(
        @Param("resourceId") Long resourceId,
        @Param("bookingDate") LocalDate bookingDate,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime,
        @Param("bookingId") Long bookingId
    );
}
