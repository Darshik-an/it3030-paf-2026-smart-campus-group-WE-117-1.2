package com.example.backend.controller.ticketing;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateHelpdeskTechnicianRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 120, message = "Name must be between 2 and 120 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    @Size(max = 255, message = "Email is too long")
    private String email;

    @Size(max = 64, message = "Phone must be at most 64 characters")
    private String phone;

    @NotBlank(message = "Category is required")
    @Size(max = 64, message = "Category is too long")
    private String category;

    /** Optional; stored as "General" when blank. */
    @Size(max = 255, message = "Specialization must be at most 255 characters")
    private String specialization;
}
