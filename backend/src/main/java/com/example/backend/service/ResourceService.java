package com.example.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.model.Resource;
import com.example.backend.model.ResourceType;
import com.example.backend.repository.ResourceRepository;

@Service
public class ResourceService {
    @Autowired
    private ResourceRepository resourceRepository;

    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
    }

    public Resource updateResource(Long id, Resource updatedResource) {
        Resource resource = getResourceById(id);
        resource.setName(updatedResource.getName());
        resource.setType(updatedResource.getType());
        resource.setCapacity(updatedResource.getCapacity());
        resource.setLocation(updatedResource.getLocation());
        resource.setStatus(updatedResource.getStatus());
        resource.setDescription(updatedResource.getDescription());
        return resourceRepository.save(resource);
    }

    public void deleteResource(Long id) {
        Resource resource = getResourceById(id);
        resourceRepository.delete(resource);
    }

    public List<Resource> searchResources(ResourceType type, Integer capacity, String location) {
        return resourceRepository.findAll().stream()
                .filter(r -> type == null || r.getType() == type)
                .filter(r -> capacity == null || (r.getCapacity() != null && r.getCapacity() >= capacity))
                .filter(r -> location == null || location.isBlank() ||
                        (r.getLocation() != null && r.getLocation().toLowerCase().contains(location.toLowerCase())))
                .collect(Collectors.toList());
    }
}
