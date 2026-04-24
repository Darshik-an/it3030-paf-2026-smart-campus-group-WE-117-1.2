package com.example.backend.service.ticketing;

import com.example.backend.controller.ticketing.CreateHelpdeskTechnicianRequest;
import com.example.backend.controller.ticketing.HelpdeskTechnicianResponse;
import com.example.backend.model.ticketing.HelpdeskTechnician;
import com.example.backend.model.ticketing.Ticket;
import com.example.backend.repository.ticketing.HelpdeskTechnicianRepository;
import com.example.backend.repository.ticketing.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HelpdeskTechnicianService {

    private static final List<Ticket.TicketStatus> ACTIVE_STATUSES = List.of(
            Ticket.TicketStatus.OPEN,
            Ticket.TicketStatus.IN_PROGRESS
    );

    private final HelpdeskTechnicianRepository technicianRepository;
    private final TicketRepository ticketRepository;

    @Transactional
    public void syncActiveTicketsFromTickets() {
        List<Ticket> allTickets = ticketRepository.findAllByOrderByCreatedAtDesc();
        List<HelpdeskTechnician> technicians = technicianRepository.findAll();

        boolean changed = false;
        for (HelpdeskTechnician technician : technicians) {
            List<String> latestRefs = activeTicketRefs(technician, allTickets);
            List<String> currentRefs = technician.getActiveTicketRefs();
            if (!currentRefs.equals(latestRefs)) {
                technician.setActiveTicketRefs(latestRefs);
                changed = true;
            }
        }

        if (changed) {
            technicianRepository.saveAll(technicians);
        }
    }

    public List<HelpdeskTechnicianResponse> findAllForRoster() {
        syncActiveTicketsFromTickets();
        return technicianRepository.findAll().stream()
                .sorted(Comparator.comparing(HelpdeskTechnician::getId))
                .map(t -> HelpdeskTechnicianResponse.from(t, t.getActiveTicketRefs()))
                .toList();
    }

    @Transactional
    public HelpdeskTechnicianResponse create(CreateHelpdeskTechnicianRequest request) {
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        if (technicianRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("A technician with this email already exists.");
        }

        HelpdeskTechnician entity = new HelpdeskTechnician();
        entity.setName(request.getName().trim());
        entity.setEmail(email);
        entity.setPhone(request.getPhone() != null ? request.getPhone().trim() : "");
        entity.setCategory(request.getCategory().trim());
        String spec = request.getSpecialization() != null ? request.getSpecialization().trim() : "";
        entity.setSpecialization(spec.isEmpty() ? "General" : spec);

        entity.setActiveTicketRefs(List.of());
        HelpdeskTechnician saved = technicianRepository.save(entity);
        return HelpdeskTechnicianResponse.from(saved, saved.getActiveTicketRefs());
    }

    @Transactional
    public HelpdeskTechnicianResponse update(Long id, CreateHelpdeskTechnicianRequest request) {
        HelpdeskTechnician entity = technicianRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Technician not found."));

        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        if (!Objects.equals(entity.getEmail().toLowerCase(Locale.ROOT), email)
                && technicianRepository.existsByEmailIgnoreCaseAndIdNot(email, id)) {
            throw new IllegalArgumentException("A technician with this email already exists.");
        }

        entity.setName(request.getName().trim());
        entity.setEmail(email);
        entity.setPhone(request.getPhone() != null ? request.getPhone().trim() : "");
        entity.setCategory(request.getCategory().trim());
        String spec = request.getSpecialization() != null ? request.getSpecialization().trim() : "";
        entity.setSpecialization(spec.isEmpty() ? "General" : spec);

        HelpdeskTechnician saved = technicianRepository.save(entity);
        return HelpdeskTechnicianResponse.from(saved, saved.getActiveTicketRefs());
    }

    @Transactional
    public void deleteById(Long id) {
        if (!technicianRepository.existsById(id)) {
            throw new IllegalArgumentException("Technician not found.");
        }
        technicianRepository.deleteById(id);
    }

    private List<String> activeTicketRefs(HelpdeskTechnician technician, List<Ticket> allTickets) {
        String nameKey = technician.getName().trim().toLowerCase(Locale.ROOT);
        String emailKey = technician.getEmail().trim().toLowerCase(Locale.ROOT);

        return allTickets.stream()
                .filter(t -> t.getAssignedTechnician() != null && !t.getAssignedTechnician().isBlank())
                .filter(t -> ACTIVE_STATUSES.contains(t.getStatus()))
                .filter(t -> {
                    String a = t.getAssignedTechnician().trim().toLowerCase(Locale.ROOT);
                    return a.equals(nameKey) || a.equals(emailKey);
                })
                .sorted(Comparator.comparing(Ticket::getId).reversed())
                .map(t -> "#" + t.getId())
                .collect(Collectors.toList());
    }
}
