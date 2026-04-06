package com.finance.dashboard.dto.request;

import com.finance.dashboard.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateUserRequest {

    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @Email(message = "Must be a valid email address")
    private String email;

    @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
    private String password; // optional — only updated if provided

    private Role role;

    private Boolean active;
}
