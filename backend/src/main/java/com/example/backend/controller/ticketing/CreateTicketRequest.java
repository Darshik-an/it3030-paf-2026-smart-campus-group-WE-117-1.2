package com.example.backend.controller.ticketing;

import lombok.Data;

@Data
public class CreateTicketRequest {
    private String resource;
    private String category;
    private String priority;
    private String description;
}
