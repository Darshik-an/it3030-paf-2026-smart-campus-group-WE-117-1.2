package com.example.backend.model.ticketing;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

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

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
