package com.example.backend.dto.auth;

import com.example.backend.model.auth.User;
import lombok.Data;

@Data
public class CreateStaffRequest {
    private String name;
    private String email;
    private String password;
    private String phoneNumber;
    private User.Role role;
}
