package com.example.backend.controller.ticketing;

import com.example.backend.model.ticketing.HelpdeskTechnician;
import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class HelpdeskTechnicianResponse {
    Long id;
    String techId;
    String name;
    String email;
    String phone;
    String category;
    String specialization;
    List<String> activeTickets;

    public static HelpdeskTechnicianResponse from(
            HelpdeskTechnician entity,
            List<String> activeTickets
    ) {
        String techId = "TECH-" + String.format("%03d", entity.getId());
        return HelpdeskTechnicianResponse.builder()
                .id(entity.getId())
                .techId(techId)
                .name(entity.getName())
                .email(entity.getEmail())
                .phone(entity.getPhone() != null ? entity.getPhone() : "")
                .category(entity.getCategory())
                .specialization(entity.getSpecialization())
                .activeTickets(activeTickets)
                .build();
    }
}
