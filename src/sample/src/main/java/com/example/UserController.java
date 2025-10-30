package com.example;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUser(@PathVariable Long id) {
        UserDto dto = new UserDto(id, "john.doe@example.com", "John Doe");
        return ResponseEntity.ok(dto);
    }

    @PostMapping("")
    public ResponseEntity<UserDto> createUser(@RequestBody CreateUserRequest req) {
        UserDto dto = new UserDto(1L, req.getEmail(), req.getName());
        return ResponseEntity.ok(dto);
    }
}

class UserDto {
    private Long id;
    private String email;
    private String name;

    public UserDto(Long id, String email, String name) {
        this.id = id;
        this.email = email;
        this.name = name;
    }
    // getters/setters omitted for brevity
}

class CreateUserRequest {
    private String email;
    private String name;

    public String getEmail() { return email; }
    public String getName() { return name; }
}
