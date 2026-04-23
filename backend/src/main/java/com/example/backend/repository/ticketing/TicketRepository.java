package com.example.backend.repository.ticketing;

import com.example.backend.model.auth.User;
import com.example.backend.model.ticketing.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByUserOrderByCreatedAtDesc(User user);
    Optional<Ticket> findByIdAndUser(Long id, User user);
}
