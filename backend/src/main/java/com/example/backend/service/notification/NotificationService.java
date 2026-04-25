package com.example.backend.service.notification;

import com.example.backend.dto.notification.NotificationResponse;
import com.example.backend.model.auth.User;
import com.example.backend.model.booking.Booking;
import com.example.backend.model.notification.Notification;
import com.example.backend.model.notification.NotificationType;
import com.example.backend.model.ticketing.Ticket;
import com.example.backend.repository.auth.UserRepository;
import com.example.backend.repository.notification.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationSseBroadcaster sseBroadcaster;
    private final UserRepository userRepository;

    @Transactional
    public Notification createNotification(Long userId, String title, String message, NotificationType type, String referenceId) {
        return createAndPush(userId, title, message, null, type, referenceId, null);
    }

    @Transactional
    public Notification createAndPush(Long userId, String title, String message, String detailMessage,
                                      NotificationType type, String referenceId, String actionPath) {
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .detailMessage(detailMessage != null ? detailMessage : message)
                .type(type)
                .referenceId(referenceId)
                .actionPath(actionPath)
                .read(false)
                .build();
        try {
            Notification saved = notificationRepository.save(notification);
            broadcast(saved);
            return saved;
        } catch (Exception ex) {
            // Keep booking/ticket/resource flows resilient even if notification write fails.
            log.warn("Notification write failed for userId={} type={} ref={}: {}",
                    userId, type, referenceId, ex.getMessage());
            return notification;
        }
    }

    public void broadcast(Notification saved) {
        long unread = notificationRepository.countByUserIdAndReadFalse(saved.getUserId());
        try {
            sseBroadcaster.sendToUser(saved.getUserId(), Map.of(
                    "unreadCount", unread,
                    "notification", NotificationResponse.from(saved)
            ));
        } catch (Exception ignored) {
            // Notification persistence should never fail because of stream delivery.
        }
    }

    private void pushUnreadOnly(Long userId) {
        long unread = notificationRepository.countByUserIdAndReadFalse(userId);
        try {
            sseBroadcaster.sendToUser(userId, Map.of("unreadCount", unread));
        } catch (Exception ignored) {
            // Keep write endpoints resilient when SSE stream is unavailable.
        }
    }

    public List<NotificationResponse> getUserNotificationsDto(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(NotificationResponse::from)
                .toList();
    }

    public Page<NotificationResponse> getUserNotificationsPage(Long userId, int page, int size, Boolean unreadOnly) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100));
        Page<Notification> entityPage;
        if (Boolean.TRUE.equals(unreadOnly)) {
            entityPage = notificationRepository.findByUserIdAndReadOrderByCreatedAtDesc(userId, false, pageable);
        } else {
            entityPage = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        }
        return entityPage.map(NotificationResponse::from);
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to mark this notification");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
        pushUnreadOnly(userId);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
        pushUnreadOnly(userId);
    }

    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this notification");
        }

        notificationRepository.delete(notification);
        pushUnreadOnly(userId);
    }

    // --- Domain: bookings ---

    @Transactional
    public void onBookingCreated(Booking booking) {
        Long studentId = booking.getUser().getId();
        String resName = booking.getResource() != null ? booking.getResource().getName() : "Facility";
        String ref = String.valueOf(booking.getId());
        String studentPath = "/dashboard/bookings/" + ref;
        String shortStudent = "Your request for " + resName + " is pending review.";
        String detailStudent = bookingDetailBlock(booking, "We will notify you when staff approves or rejects this booking.");
        createAndPush(studentId, "Booking submitted", shortStudent, detailStudent,
                NotificationType.BOOKING_SUBMITTED, ref, studentPath);

        String shortStaff = "New booking: " + resName + " on " + booking.getBookingDate();
        String detailStaff = bookingDetailBlock(booking, "Review this request in the dashboard.");
        for (Long sid : bookingStaffRecipientIds()) {
            createAndPush(sid, "New booking request", shortStaff, detailStaff,
                    NotificationType.BOOKING_NEW_PENDING, ref, "/dashboard");
        }
    }

    @Transactional
    public void onBookingStatusChanged(Booking booking, Booking.BookingStatus previousStatus) {
        if (previousStatus == booking.getStatus()) {
            return;
        }
        Long ownerId = booking.getUser().getId();
        String ref = String.valueOf(booking.getId());
        String path = "/dashboard/bookings/" + ref;
        String resName = booking.getResource() != null ? booking.getResource().getName() : "Facility";
        Booking.BookingStatus st = booking.getStatus();

        if (st == Booking.BookingStatus.APPROVED) {
            String msg = "Your booking for " + resName + " was approved.";
            createAndPush(ownerId, "Booking approved", msg, bookingDetailBlock(booking, msg),
                    NotificationType.BOOKING_APPROVED, ref, path);
        } else if (st == Booking.BookingStatus.REJECTED) {
            String reason = booking.getRejectionReason() != null && !booking.getRejectionReason().isBlank()
                    ? booking.getRejectionReason() : "No reason provided.";
            String msg = "Your booking for " + resName + " was rejected.";
            String detail = bookingDetailBlock(booking, "Reason: " + reason);
            createAndPush(ownerId, "Booking rejected", msg, detail,
                    NotificationType.BOOKING_REJECTED, ref, path);
        } else if (st == Booking.BookingStatus.CANCELLED && previousStatus != Booking.BookingStatus.CANCELLED) {
            // Admin/staff cancelled via status update (not user delete flow)
            String msg = "Your booking for " + resName + " was cancelled.";
            createAndPush(ownerId, "Booking cancelled", msg, bookingDetailBlock(booking, msg),
                    NotificationType.BOOKING_CANCELLED, ref, path);
        }
    }

    @Transactional
    public void onUserCancelledBooking(Booking booking) {
        Long ownerId = booking.getUser().getId();
        String ref = String.valueOf(booking.getId());
        String path = "/dashboard/bookings/" + ref;
        String resName = booking.getResource() != null ? booking.getResource().getName() : "Facility";
        String msg = "You cancelled your booking for " + resName + ".";
        createAndPush(ownerId, "Booking cancelled", msg, bookingDetailBlock(booking, "This slot is released for others."),
                NotificationType.BOOKING_CANCELLED, ref, path);

        String staffMsg = booking.getUser().getName() + " cancelled booking #" + ref + " (" + resName + ").";
        String staffDetail = bookingDetailBlock(booking, "The user cancelled an approved booking.");
        for (Long sid : bookingStaffRecipientIds()) {
            createAndPush(sid, "User cancelled a booking", staffMsg, staffDetail,
                    NotificationType.BOOKING_USER_CANCELLED_ALERT, ref, "/dashboard");
        }
    }

    private List<Long> bookingStaffRecipientIds() {
        return userRepository.findByRoleIn(List.of(User.Role.ADMIN, User.Role.FACILITY_MANAGER)).stream()
                .map(User::getId)
                .distinct()
                .toList();
    }

    private String bookingDetailBlock(Booking b, String headline) {
        String res = b.getResource() != null ? b.getResource().getName() : "—";
        return headline + "\n\nFacility: " + res
                + "\nDate: " + b.getBookingDate()
                + "\nTime: " + b.getStartTime() + " – " + b.getEndTime()
                + "\nPurpose: " + b.getPurpose()
                + "\nAttendees: " + b.getExpectedAttendees()
                + "\nCurrent status: " + b.getStatus();
    }

    // --- Domain: tickets ---

    @Transactional
    public void onTicketCreated(Ticket ticket) {
        Long reporterId = ticket.getUser().getId();
        String ref = String.valueOf(ticket.getId());
        String path = "/tickets/" + ref;
        String shortR = "Ticket #" + ref + " was created successfully.";
        createAndPush(reporterId, "Ticket submitted", shortR, ticketDetailBlock(ticket, "You can track progress here anytime."),
                NotificationType.TICKET_CREATED_USER, ref, path);

        String shortS = "New ticket #" + ref + ": " + ticket.getResource() + " (" + ticket.getPriority() + ").";
        for (Long uid : userRepository.findByRoleIn(List.of(User.Role.ADMIN, User.Role.STUDENT_SUPPORT)).stream().map(User::getId).distinct().toList()) {
            createAndPush(uid, "New support ticket", shortS, ticketDetailBlock(ticket, "Triage this ticket in the ticketing dashboard."),
                    NotificationType.TICKET_NEW_FOR_STAFF, ref, path);
        }
    }

    @Transactional
    public void onTicketUpdatedByManagement(Ticket.TicketStatus prevStatus, String prevAssignRaw, Ticket after) {
        Ticket.TicketStatus newStatus = after.getStatus();
        String prevAssign = normalizeAssignee(prevAssignRaw);
        String newAssign = normalizeAssignee(after.getAssignedTechnician());
        Long reporterId = after.getUser().getId();
        String ref = String.valueOf(after.getId());
        String path = "/tickets/" + ref;

        if (prevStatus != newStatus) {
            if (newStatus == Ticket.TicketStatus.REJECTED) {
                String reason = after.getRejectionReason() != null ? after.getRejectionReason() : "No reason provided.";
                String msg = "Ticket #" + ref + " was rejected.";
                createAndPush(reporterId, "Ticket rejected", msg, ticketDetailBlock(after, "Reason: " + reason),
                        NotificationType.TICKET_REJECTED, ref, path);
            } else {
                String msg = "Ticket #" + ref + " is now " + friendlyStatus(newStatus) + ".";
                createAndPush(reporterId, "Ticket status updated", msg, ticketDetailBlock(after, msg),
                        NotificationType.TICKET_STATUS_CHANGED, ref, path);
            }
        }

        if (!Objects.equals(prevAssign, newAssign) && newAssign != null && !newAssign.isBlank()) {
            String msgStudent = "Technician assigned: " + after.getAssignedTechnician() + ".";
            createAndPush(reporterId, "Technician assigned", msgStudent, ticketDetailBlock(after, msgStudent),
                    NotificationType.TICKET_ASSIGNED, ref, path);
            resolveTechnicianUser(after.getAssignedTechnician()).ifPresent(tech ->
                    createAndPush(tech.getId(), "Ticket assigned to you",
                            "Ticket #" + ref + " — " + after.getResource(),
                            ticketDetailBlock(after, "You were assigned to this ticket."),
                            NotificationType.TICKET_ASSIGNED, ref, path));
        }
    }

    @Transactional
    public void onTicketUpdatedByTechnician(Ticket.TicketStatus previousStatus, Ticket after) {
        Ticket.TicketStatus next = after.getStatus();
        if (previousStatus == next) {
            return;
        }
        if (next != Ticket.TicketStatus.RESOLVED && next != Ticket.TicketStatus.CLOSED) {
            return;
        }
        Long reporterId = after.getUser().getId();
        String ref = String.valueOf(after.getId());
        String path = "/tickets/" + ref;
        String msg = "Ticket #" + ref + " was marked " + friendlyStatus(next) + " by the technician.";
        createAndPush(reporterId, "Ticket updated", msg, ticketDetailBlock(after, msg),
                NotificationType.TICKET_STATUS_CHANGED, ref, path);
    }

    @Transactional
    public void onTicketComment(Ticket ticket, User author, String commentMessage) {
        String ref = String.valueOf(ticket.getId());
        String path = "/tickets/" + ref;
        String preview = commentMessage.length() > 120 ? commentMessage.substring(0, 117) + "…" : commentMessage;

        if (author.getRole() == User.Role.USER) {
            Set<Long> targets = new LinkedHashSet<>();
            userRepository.findByRoleIn(List.of(User.Role.ADMIN, User.Role.STUDENT_SUPPORT))
                    .forEach(u -> targets.add(u.getId()));
            resolveTechnicianUser(ticket.getAssignedTechnician()).ifPresent(u -> targets.add(u.getId()));
            for (Long uid : targets) {
                createAndPush(uid, "New ticket comment",
                        "Ticket #" + ref + ": " + preview,
                        ticketDetailBlock(ticket, author.getName() + " commented:\n\n" + commentMessage),
                        NotificationType.TICKET_COMMENT, ref, path);
            }
        } else {
            Long reporterId = ticket.getUser().getId();
            createAndPush(reporterId, "Update on your ticket",
                    "Staff commented on ticket #" + ref + ".",
                    ticketDetailBlock(ticket, author.getName() + " (" + author.getRole() + ") commented:\n\n" + commentMessage),
                    NotificationType.TICKET_COMMENT, ref, path);
        }
    }

    private String ticketDetailBlock(Ticket t, String headline) {
        return headline + "\n\nTicket #" + t.getId()
                + "\nResource: " + t.getResource()
                + "\nCategory: " + (t.getCategory() != null ? t.getCategory().name() : "—")
                + "\nPriority: " + t.getPriority()
                + "\nStatus: " + t.getStatus()
                + (t.getAssignedTechnician() != null && !t.getAssignedTechnician().isBlank()
                ? "\nAssigned: " + t.getAssignedTechnician() : "");
    }

    private String friendlyStatus(Ticket.TicketStatus s) {
        return s.name().replace('_', ' ').toLowerCase(Locale.ROOT);
    }

    private String normalizeAssignee(String s) {
        if (s == null) {
            return "";
        }
        return s.trim().toLowerCase(Locale.ROOT);
    }

    private Optional<User> resolveTechnicianUser(String assignedTechnician) {
        if (assignedTechnician == null || assignedTechnician.isBlank()) {
            return Optional.empty();
        }
        String key = assignedTechnician.trim().toLowerCase(Locale.ROOT);
        return userRepository.findByRole(User.Role.TECHNICIAN).stream()
                .filter(u -> {
                    String e = u.getEmail() != null ? u.getEmail().trim().toLowerCase(Locale.ROOT) : "";
                    String n = u.getName() != null ? u.getName().trim().toLowerCase(Locale.ROOT) : "";
                    return (!e.isBlank() && e.equals(key)) || (!n.isBlank() && n.equals(key));
                })
                .findFirst();
    }

    // --- Domain: resources (facilities) ---

    @Transactional
    public void onResourceCreated(com.example.backend.model.Resource resource) {
        facilityManagerBroadcast("New facility published", "Resource \"" + resource.getName() + "\" was added to the catalog.",
                resourceDetail(resource, "An administrator added this resource."),
                NotificationType.FACILITY_RESOURCE_CREATED, String.valueOf(resource.getId()), "/dashboard/facilities");
    }

    @Transactional
    public void onResourceUpdated(com.example.backend.model.Resource resource) {
        facilityManagerBroadcast("Facility updated", "Resource \"" + resource.getName() + "\" was updated.",
                resourceDetail(resource, "An administrator updated this resource."),
                NotificationType.FACILITY_RESOURCE_UPDATED, String.valueOf(resource.getId()), "/dashboard/facilities");
    }

    @Transactional
    public void onResourceDeleted(com.example.backend.model.Resource resource) {
        facilityManagerBroadcast("Facility removed", "Resource \"" + resource.getName() + "\" was removed from the catalog.",
                resourceDetail(resource, "This resource no longer appears in booking search."),
                NotificationType.FACILITY_RESOURCE_DELETED, String.valueOf(resource.getId()), "/dashboard/facilities");
    }

    private void facilityManagerBroadcast(String title, String message, String detail, NotificationType type, String refId, String actionPath) {
        List<User> managers = userRepository.findByRole(User.Role.FACILITY_MANAGER);
        for (User u : managers) {
            createAndPush(u.getId(), title, message, detail, type, refId, actionPath);
        }
    }

    private String resourceDetail(com.example.backend.model.Resource r, String headline) {
        return headline + "\n\nName: " + r.getName()
                + "\nType: " + r.getType()
                + "\nLocation: " + (r.getLocation() != null ? r.getLocation() : "—")
                + "\nCapacity: " + (r.getCapacity() != null ? r.getCapacity() : "—")
                + "\nStatus: " + r.getStatus();
    }
}
