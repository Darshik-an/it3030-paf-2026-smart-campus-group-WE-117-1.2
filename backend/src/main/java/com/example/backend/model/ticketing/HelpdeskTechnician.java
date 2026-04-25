package com.example.backend.model.ticketing;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "helpdesk_technicians")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HelpdeskTechnician {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false, length = 255)
    private String email;

    @Column(length = 64)
    private String phone;

    @Column(nullable = false, length = 64)
    private String category;

    @Column(nullable = false, length = 255)
    private String specialization;

    @Column(name = "active_tickets", columnDefinition = "TEXT")
    private String activeTickets;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public List<String> getActiveTicketRefs() {
        if (activeTickets == null || activeTickets.isBlank()) return new ArrayList<>();
        return Arrays.stream(activeTickets.split(","))
                .map(String::trim)
                .filter(v -> !v.isEmpty())
                .collect(Collectors.toCollection(ArrayList::new));
    }

    public void setActiveTicketRefs(List<String> refs) {
        if (refs == null || refs.isEmpty()) {
            this.activeTickets = "";
            return;
        }
        this.activeTickets = refs.stream()
                .map(String::trim)
                .filter(v -> !v.isEmpty())
                .collect(Collectors.joining(","));
    }
}
