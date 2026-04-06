package com.finance.dashboard.service;

import com.finance.dashboard.dto.request.RegisterRequest;
import com.finance.dashboard.dto.request.UpdateUserRequest;
import com.finance.dashboard.dto.response.PagedResponse;
import com.finance.dashboard.dto.response.UserResponse;
import com.finance.dashboard.entity.Role;

public interface UserService {
    PagedResponse<UserResponse> getAllUsers(String search, Role role, int page, int size);
    UserResponse getUserById(Long id);
    UserResponse createUser(RegisterRequest request);
    UserResponse updateUser(Long id, UpdateUserRequest request);
    void deleteUser(Long id);
    void toggleUserStatus(Long id);
}
