package com.example.backend.controller.ticketing;

import com.example.backend.model.auth.User;
import com.example.backend.model.ticketing.Ticket;
import com.example.backend.repository.auth.UserRepository;
import com.example.backend.service.ticketing.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TicketController {
    private final TicketService ticketService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<?> getMyTickets() {
        try {
            User user = getCurrentUser();
            List<TicketResponse> response = ticketService.getUserTickets(user)
                    .stream()
                    .map(TicketResponse::from)
                    .toList();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createTicket(@RequestBody CreateTicketRequest request) {
        try {
            User user = getCurrentUser();
            Ticket saved = ticketService.createTicket(
                    user,
                    request.getResource(),
                    request.getCategory(),
                    request.getPriority(),
                    request.getDescription()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(TicketResponse.from(saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createTicketWithImages(
            @RequestParam String resource,
            @RequestParam String category,
            @RequestParam String priority,
            @RequestParam String description,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        try {
            User user = getCurrentUser();
            Ticket saved = ticketService.createTicket(
                    user,
                    resource,
                    category,
                    priority,
                    description,
                    images == null ? List.of() : images
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(TicketResponse.from(saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }
}
