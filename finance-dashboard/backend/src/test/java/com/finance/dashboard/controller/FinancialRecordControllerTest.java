package com.finance.dashboard.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finance.dashboard.dto.request.FinancialRecordRequest;
import com.finance.dashboard.dto.request.LoginRequest;
import com.finance.dashboard.dto.request.RegisterRequest;
import com.finance.dashboard.entity.Role;
import com.finance.dashboard.entity.TransactionType;
import com.finance.dashboard.repository.FinancialRecordRepository;
import com.finance.dashboard.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class FinancialRecordControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired UserRepository userRepository;
    @Autowired FinancialRecordRepository recordRepository;

    private String adminToken;
    private String analystToken;
    private String viewerToken;

    @BeforeEach
    void setUp() throws Exception {
        recordRepository.deleteAll();
        userRepository.deleteAll();

        adminToken   = registerAndLogin("admin@test.com",   "pass123", Role.ADMIN);
        analystToken = registerAndLogin("analyst@test.com", "pass123", Role.ANALYST);
        viewerToken  = registerAndLogin("viewer@test.com",  "pass123", Role.VIEWER);
    }

    @Test
    @DisplayName("POST /records → 201 when ADMIN creates record")
    void adminCanCreateRecord() throws Exception {
        mockMvc.perform(post("/records")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRecord())))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.category").value("Salary"))
            .andExpect(jsonPath("$.type").value("INCOME"));
    }

    @Test
    @DisplayName("POST /records → 403 when ANALYST tries to create record")
    void analystCannotCreateRecord() throws Exception {
        mockMvc.perform(post("/records")
                .header("Authorization", "Bearer " + analystToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRecord())))
            .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /records → 403 when VIEWER tries to create record")
    void viewerCannotCreateRecord() throws Exception {
        mockMvc.perform(post("/records")
                .header("Authorization", "Bearer " + viewerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRecord())))
            .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /records → 200 when ANALYST lists records")
    void analystCanReadRecords() throws Exception {
        mockMvc.perform(get("/records")
                .header("Authorization", "Bearer " + analystToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @DisplayName("GET /records → 403 when VIEWER tries to list records")
    void viewerCannotReadRecords() throws Exception {
        mockMvc.perform(get("/records")
                .header("Authorization", "Bearer " + viewerToken))
            .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("DELETE /records/{id} → 204 soft-delete by ADMIN")
    void adminCanDeleteRecord() throws Exception {
        // Create first
        MvcResult result = mockMvc.perform(post("/records")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRecord())))
            .andExpect(status().isCreated())
            .andReturn();

        String body = result.getResponse().getContentAsString();
        Long id = objectMapper.readTree(body).get("id").asLong();

        // Then delete
        mockMvc.perform(delete("/records/" + id)
                .header("Authorization", "Bearer " + adminToken))
            .andExpect(status().isNoContent());

        // Confirm it's gone from listing
        mockMvc.perform(get("/records/" + id)
                .header("Authorization", "Bearer " + adminToken))
            .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /records → 400 when amount is zero")
    void createRecordWithZeroAmountFails() throws Exception {
        FinancialRecordRequest req = validRecord();
        req.setAmount(BigDecimal.ZERO);

        mockMvc.perform(post("/records")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.fieldErrors.amount").exists());
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private FinancialRecordRequest validRecord() {
        FinancialRecordRequest req = new FinancialRecordRequest();
        req.setAmount(new BigDecimal("50000.00"));
        req.setType(TransactionType.INCOME);
        req.setCategory("Salary");
        req.setTransactionDate(LocalDate.now().minusDays(1));
        req.setNotes("Monthly salary");
        return req;
    }

    private String registerAndLogin(String email, String password, Role role) throws Exception {
        RegisterRequest reg = new RegisterRequest();
        reg.setFullName("Test " + role.name());
        reg.setEmail(email);
        reg.setPassword(password);
        reg.setRole(role);

        MvcResult result = mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reg)))
            .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString())
            .get("token").asText();
    }
}
