package com.example.backend.repository.ticketing;

import com.example.backend.model.ticketing.HelpdeskTechnician;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HelpdeskTechnicianRepository extends JpaRepository<HelpdeskTechnician, Long> {

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);
}
