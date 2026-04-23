package com.example.backend.service.ticketing;

import com.example.backend.model.auth.User;
import com.example.backend.model.ticketing.Ticket;
import com.example.backend.repository.ticketing.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketService {
    private final TicketRepository ticketRepository;

    public List<Ticket> getUserTickets(User user) {
        return ticketRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public Optional<Ticket> getUserTicketById(User user, Long ticketId) {
        return ticketRepository.findByIdAndUser(ticketId, user);
    }

    public List<Ticket> getAllTicketsForManagement() {
        return ticketRepository.findAllByOrderByCreatedAtDesc();
    }

    public Ticket createTicket(User user, String resource, String category, String priority, String description) {
        return createTicket(user, resource, category, priority, description, List.of());
    }

    public Ticket createTicket(
            User user,
            String resource,
            String category,
            String priority,
            String description,
            List<MultipartFile> images
    ) {
        if (isBlank(resource) || isBlank(category) || isBlank(priority) || isBlank(description)) {
            throw new IllegalArgumentException("All fields are required");
        }

        if (images != null && images.size() > 3) {
            throw new IllegalArgumentException("You can upload a maximum of 3 images");
        }

        Ticket ticket = new Ticket();
        ticket.setUser(user);
        ticket.setResource(resource.trim());
        ticket.setCategory(parseCategory(category));
        ticket.setPriority(parsePriority(priority));
        ticket.setDescription(description.trim());
        ticket.setStatus(Ticket.TicketStatus.OPEN);

        List<String> storedImages = storeImages(images);
        if (storedImages.size() > 0) ticket.setImage1(storedImages.get(0));
        if (storedImages.size() > 1) ticket.setImage2(storedImages.get(1));
        if (storedImages.size() > 2) ticket.setImage3(storedImages.get(2));

        return ticketRepository.save(ticket);
    }

    public Ticket updateTicketByManagement(
            Long ticketId,
            String status,
            String assignedTechnician,
            String rejectionReason
    ) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

        if (status != null && !status.isBlank()) {
            String normalizedStatus = normalize(status);
            try {
                Ticket.TicketStatus parsed = Ticket.TicketStatus.valueOf(normalizedStatus);
                ticket.setStatus(parsed);
            } catch (Exception ex) {
                throw new IllegalArgumentException("Invalid status. Use IN_PROGRESS, RESOLVED, CLOSED, or REJECTED");
            }
        }

        if (assignedTechnician != null) {
            ticket.setAssignedTechnician(assignedTechnician.trim().isEmpty() ? null : assignedTechnician.trim());
        }

        if (ticket.getStatus() == Ticket.TicketStatus.REJECTED) {
            if (isBlank(rejectionReason)) {
                throw new IllegalArgumentException("Rejection reason is required when status is REJECTED");
            }
            ticket.setRejectionReason(rejectionReason.trim());
        } else if (rejectionReason != null) {
            ticket.setRejectionReason(rejectionReason.trim().isEmpty() ? null : rejectionReason.trim());
        }

        return ticketRepository.save(ticket);
    }

    private List<String> storeImages(List<MultipartFile> images) {
        if (images == null || images.isEmpty()) return List.of();

        try {
            Path uploadDir = Paths.get("uploads", "tickets");
            Files.createDirectories(uploadDir);

            java.util.ArrayList<String> stored = new java.util.ArrayList<>();
            for (MultipartFile file : images) {
                if (file == null || file.isEmpty()) continue;

                String contentType = file.getContentType();
                if (contentType == null || !contentType.startsWith("image/")) {
                    throw new IllegalArgumentException("Only image files are allowed");
                }

                String original = file.getOriginalFilename() == null ? "image" : file.getOriginalFilename();
                String safeName = original.replaceAll("[^a-zA-Z0-9._-]", "_");
                String fileName = UUID.randomUUID() + "_" + safeName;
                Path target = uploadDir.resolve(fileName);
                Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
                stored.add(fileName);
            }
            return stored;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store uploaded images");
        }
    }

    private Ticket.TicketCategory parseCategory(String raw) {
        String normalized = normalize(raw);
        try {
            return Ticket.TicketCategory.valueOf(normalized);
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid category. Use Hardware, Software, or Facility");
        }
    }

    private Ticket.TicketPriority parsePriority(String raw) {
        String normalized = normalize(raw);
        if (normalized.startsWith("LOW")) return Ticket.TicketPriority.LOW;
        if (normalized.startsWith("MEDIUM")) return Ticket.TicketPriority.MEDIUM;
        if (normalized.startsWith("HIGH")) return Ticket.TicketPriority.HIGH;
        if (normalized.startsWith("CRITICAL")) return Ticket.TicketPriority.CRITICAL;
        throw new IllegalArgumentException("Invalid priority. Use Low, Medium, High, or Critical");
    }

    private String normalize(String raw) {
        return raw.trim()
                .replace("-", "_")
                .replace(" ", "_")
                .toUpperCase(Locale.ROOT);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
