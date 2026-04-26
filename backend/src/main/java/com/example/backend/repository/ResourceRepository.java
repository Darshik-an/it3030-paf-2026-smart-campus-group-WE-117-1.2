package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.Resource;
import com.example.backend.model.ResourceType;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    boolean existsByResourceCode(String resourceCode);

    List<Resource> findByResourceCodeIsNull();

    List<Resource> findByTypeAndCapacityGreaterThanEqualAndLocationContainingIgnoreCase(ResourceType type, Integer capacity, String location);
}
