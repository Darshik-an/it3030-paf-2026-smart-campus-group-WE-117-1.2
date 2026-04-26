package com.example.backend.service;

import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.backend.model.Resource;
import com.example.backend.model.ResourceStatus;
import com.example.backend.model.ResourceType;
import com.example.backend.repository.ResourceRepository;
import com.example.backend.service.notification.NotificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ResourceService {
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;

    public Resource createResource(Resource resource) {
        validateResourceData(resource, true);
        normalizeResource(resource);
        resource.setResourceCode(generateUniqueResourceCode());
        if (resource.getStatus() == null) {
            resource.setStatus(ResourceStatus.ACTIVE);
        }
        Resource created = resourceRepository.save(resource);
        notificationService.onResourceCreated(created);
        return created;
    }

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
    }

    public Resource updateResource(Long id, Resource updatedResource) {
        validateResourceData(updatedResource, false);
        Resource resource = getResourceById(id);
        resource.setName(updatedResource.getName().trim());
        resource.setType(updatedResource.getType());
        resource.setCapacity(updatedResource.getCapacity());
        resource.setLocation(updatedResource.getLocation().trim());
        resource.setStatus(updatedResource.getStatus());
        resource.setDescription(updatedResource.getDescription() == null ? null : updatedResource.getDescription().trim());
        Resource saved = resourceRepository.save(resource);
        notificationService.onResourceUpdated(saved);
        return saved;
    }

    public void deleteResource(Long id) {
        Resource resource = getResourceById(id);
        resourceRepository.delete(resource);
        notificationService.onResourceDeleted(resource);
    }

    public List<Resource> searchResources(ResourceType type, Integer capacity, String location) {
        return resourceRepository.findAll().stream()
                .filter(r -> type == null || r.getType() == type)
                .filter(r -> capacity == null || (r.getCapacity() != null && r.getCapacity() >= capacity))
                .filter(r -> location == null || location.isBlank() ||
                        (r.getLocation() != null && r.getLocation().toLowerCase().contains(location.toLowerCase())))
                .collect(Collectors.toList());
    }

    private void validateResourceData(Resource resource, boolean isCreate) {
        if (resource == null) {
            throw new IllegalArgumentException("Resource payload is required");
        }
        if (resource.getName() == null || resource.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Facility name is required");
        }
        if (resource.getType() == null) {
            throw new IllegalArgumentException("Facility type is required");
        }
        if (resource.getType() == ResourceType.EQUIPMENT) {
            throw new IllegalArgumentException("Equipment type is retired. Please use Auditorium instead.");
        }
        if (resource.getCapacity() == null) {
            throw new IllegalArgumentException("Capacity is required");
        }
        if (resource.getCapacity() < 1) {
            throw new IllegalArgumentException("Capacity must be a positive number");
        }
        if (resource.getLocation() == null || resource.getLocation().trim().isEmpty()) {
            throw new IllegalArgumentException("Location is required");
        }
        if (resource.getStatus() == null && !isCreate) {
            throw new IllegalArgumentException("Status is required");
        }
    }

    private void normalizeResource(Resource resource) {
        resource.setName(resource.getName().trim());
        resource.setLocation(resource.getLocation().trim());
        resource.setDescription(Objects.toString(resource.getDescription(), "").trim());
        if (resource.getDescription().isEmpty()) {
            resource.setDescription(null);
        }
    }

    private String generateUniqueResourceCode() {
        String code;
        do {
            code = "FAC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
        } while (resourceRepository.existsByResourceCode(code));
        return code;
    }
}
