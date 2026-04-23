package com.example.backend;

import com.example.backend.model.auth.User;
import com.example.backend.repository.auth.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
	public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			if (userRepository.findByEmail("admin@smartcampus.edu").isEmpty()) {
				User admin = new User();
				admin.setName("System Admin");
				admin.setEmail("admin@smartcampus.edu");
				admin.setPassword(passwordEncoder.encode("Admin@123"));
				admin.setRole(User.Role.ADMIN);
				userRepository.save(admin);
				System.out.println("Admin user created: admin@smartcampus.edu / Admin@123");
			}
		};
	}

}
