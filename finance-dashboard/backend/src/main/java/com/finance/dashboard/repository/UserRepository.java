package com.finance.dashboard.repository;

import com.finance.dashboard.entity.Role;
import com.finance.dashboard.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);


    Optional<User> findByEmailAndActiveTrue(String email);


    @Query("""
        SELECT u FROM User u
        WHERE (:search IS NULL
               OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(u.email)    LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:role IS NULL OR u.role = :role)
        """)
    Page<User> searchUsers(
        @Param("search") String search,
        @Param("role")   Role role,
        Pageable pageable
    );

    long countByActiveTrue();
    long countByRole(Role role);
}
