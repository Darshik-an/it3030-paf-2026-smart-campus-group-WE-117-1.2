package com.example.backend.service.ticketing;

import com.example.backend.model.auth.User;
import com.example.backend.model.ticketing.Ticket;
import com.example.backend.model.ticketing.TicketComment;
import com.example.backend.repository.ticketing.TicketCommentRepository;
import com.example.backend.repository.ticketing.TicketRepository;
import com.example.backend.service.notification.NotificationService;
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
    private final HelpdeskTechnicianService technicianService;
    private final TicketCommentRepository commentRepository;
    private final NotificationService notificationService;

    public List<Ticket> getUserTickets(User user) {
        return ticketRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public Optional<Ticket> getUserTicketById(User user, Long ticketId) {
        return ticketRepository.findByIdAndUser(ticketId, user);
    }

    public Optional<Ticket> getTicketById(Long ticketId) {
        return ticketRepository.findById(ticketId);
    }

    public boolean canViewTicket(User user, Ticket ticket) {
        if (user == null || ticket == null) return false;

        if (user.getRole() == User.Role.ADMIN || user.getRole() == User.Role.STUDENT_SUPPORT) {
            return true;
        }

        if (ticket.getUser() != null && ticket.getUser().getId() != null
                && user.getId() != null
                && ticket.getUser().getId().equals(user.getId())) {
            return true;
        }

        if (user.getRole() == User.Role.TECHNICIAN) {
            String assigned = ticket.getAssignedTechnician();
            if (assigned == null || assigned.isBlank()) return false;
            String assignedKey = assigned.trim().toLowerCase(Locale.ROOT);
            String nameKey = user.getName() != null ? user.getName().trim().toLowerCase(Locale.ROOT) : "";
            String emailKey = user.getEmail() != null ? user.getEmail().trim().toLowerCase(Locale.ROOT) : "";
            return (!nameKey.isBlank() && assignedKey.equals(nameKey))
                    || (!emailKey.isBlank() && assignedKey.equals(emailKey));
        }

        return false;
    }

    public List<TicketComment> getCommentsForTicket(User user, Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        if (!canViewTicket(user, ticket)) {
            throw new IllegalArgumentException("Ticket not found");
        }
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    public TicketComment addCommentToTicket(User user, Long ticketId, String message) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        if (!canViewTicket(user, ticket)) {
            throw new IllegalArgumentException("Ticket not found");
        }
        if (message == null || message.trim().isEmpty()) {
            throw new IllegalArgumentException("Message is required");
        }

        TicketComment c = new TicketComment();
        c.setTicket(ticket);
        c.setAuthor(user);
        c.setMessage(message.trim());
        TicketComment saved = commentRepository.save(c);
        notificationService.onTicketComment(ticket, user, saved.getMessage());
        return saved;
    }

    public void deleteMyComment(User user, Long ticketId, Long commentId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        if (!canViewTicket(user, ticket)) {
            throw new IllegalArgumentException("Ticket not found");
        }

        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        if (comment.getTicket() == null || comment.getTicket().getId() == null
                || !comment.getTicket().getId().equals(ticketId)) {
            throw new IllegalArgumentException("Comment not found");
        }

        if (comment.getAuthor() == null || comment.getAuthor().getId() == null
                || user.getId() == null
                || !comment.getAuthor().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You can only delete your own comments.");
        }

        commentRepository.delete(comment);
    }

    public List<Ticket> getAllTicketsForManagement() {
        return ticketRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Ticket> getTicketsAssignedToTechnician(User technicianUser) {
        String nameKey = technicianUser.getName() != null ? technicianUser.getName().trim().toLowerCase(Locale.ROOT) : "";
        String emailKey = technicianUser.getEmail() != null ? technicianUser.getEmail().trim().toLowerCase(Locale.ROOT) : "";

        return ticketRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(t -> t.getAssignedTechnician() != null && !t.getAssignedTechnician().isBlank())
                .filter(t -> {
                    String a = t.getAssignedTechnician().trim().toLowerCase(Locale.ROOT);
                    return (!nameKey.isBlank() && a.equals(nameKey)) || (!emailKey.isBlank() && a.equals(emailKey));
                })
                .toList();
    }

    public Ticket updateTicketStatusByTechnician(User technicianUser, Long ticketId, String status) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

        Ticket.TicketStatus previousStatus = ticket.getStatus();

        if (ticket.getAssignedTechnician() == null || ticket.getAssignedTechnician().isBlank()) {
            throw new IllegalArgumentException("This ticket is not assigned to you.");
        }

        String nameKey = technicianUser.getName() != null ? technicianUser.getName().trim().toLowerCase(Locale.ROOT) : "";
        String emailKey = technicianUser.getEmail() != null ? technicianUser.getEmail().trim().toLowerCase(Locale.ROOT) : "";
        String assignedKey = ticket.getAssignedTechnician().trim().toLowerCase(Locale.ROOT);

        boolean isMine = (!nameKey.isBlank() && assignedKey.equals(nameKey)) || (!emailKey.isBlank() && assignedKey.equals(emailKey));
        if (!isMine) {
            throw new IllegalArgumentException("This ticket is not assigned to you.");
        }

        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("Status is required.");
        }

        String normalizedStatus = normalize(status);
        Ticket.TicketStatus parsed;
        try {
            parsed = Ticket.TicketStatus.valueOf(normalizedStatus);
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid status. Use RESOLVED or CLOSED.");
        }

        if (parsed != Ticket.TicketStatus.RESOLVED && parsed != Ticket.TicketStatus.CLOSED) {
            throw new IllegalArgumentException("Invalid status. Use RESOLVED or CLOSED.");
        }

        ticket.setStatus(parsed);
        Ticket saved = ticketRepository.save(ticket);
        technicianService.syncActiveTicketsFromTickets();
        notificationService.onTicketUpdatedByTechnician(previousStatus, saved);
        return saved;
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

        Ticket saved = ticketRepository.save(ticket);
        technicianService.syncActiveTicketsFromTickets();
        notificationService.onTicketCreated(saved);
        return saved;
    }

    public Ticket updateTicketByManagement(
            Long ticketId,
            String status,
            String assignedTechnician,
            String rejectionReason
    ) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

        Ticket.TicketStatus previousStatus = ticket.getStatus();
        String previousAssignee = ticket.getAssignedTechnician();

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
            ticket.setRejectionReason(isBlank(rejectionReason) ? null : rejectionReason.trim());
        } else if (rejectionReason != null) {
            ticket.setRejectionReason(rejectionReason.trim().isEmpty() ? null : rejectionReason.trim());
        }

        Ticket saved = ticketRepository.save(ticket);
        technicianService.syncActiveTicketsFromTickets();
        notificationService.onTicketUpdatedByManagement(previousStatus, previousAssignee, saved);
        return saved;
    }

    public void deleteTicketByManagement(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        ticketRepository.delete(ticket);
        technicianService.syncActiveTicketsFromTickets();
    }

    public Ticket updateMyOpenTicket(
            User user,
            Long ticketId,
            String resource,
            String category,
            String priority,
            String description
    ) {
        Ticket ticket = ticketRepository.findByIdAndUser(ticketId, user)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

        if (ticket.getStatus() != Ticket.TicketStatus.OPEN) {
            throw new IllegalArgumentException("You can only edit tickets that are in OPEN status.");
        }

        if (isBlank(resource) || isBlank(category) || isBlank(priority) || isBlank(description)) {
            throw new IllegalArgumentException("All fields are required");
        }

        ticket.setResource(resource.trim());
        ticket.setCategory(parseCategory(category));
        ticket.setPriority(parsePriority(priority));
        ticket.setDescription(description.trim());

        Ticket saved = ticketRepository.save(ticket);
        technicianService.syncActiveTicketsFromTickets();
        return saved;
    }

    public void deleteMyOpenTicket(User user, Long ticketId) {
        Ticket ticket = ticketRepository.findByIdAndUser(ticketId, user)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

        if (ticket.getStatus() != Ticket.TicketStatus.OPEN) {
            throw new IllegalArgumentException("You can only delete tickets that are in OPEN status.");
        }

        ticketRepository.delete(ticket);
        technicianService.syncActiveTicketsFromTickets();
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
