package com.finance.dashboard.dto.response;

import com.finance.dashboard.entity.FinancialRecord;
import com.finance.dashboard.entity.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class FinancialRecordResponse {
    private Long id;
    private BigDecimal amount;
    private TransactionType type;
    private String category;
    private LocalDate transactionDate;
    private String notes;
    private String createdByName;
    private String createdByEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static FinancialRecordResponse from(FinancialRecord r) {
        return FinancialRecordResponse.builder()
            .id(r.getId())
            .amount(r.getAmount())
            .type(r.getType())
            .category(r.getCategory())
            .transactionDate(r.getTransactionDate())
            .notes(r.getNotes())
            .createdByName(r.getCreatedBy() != null ? r.getCreatedBy().getFullName() : null)
            .createdByEmail(r.getCreatedBy() != null ? r.getCreatedBy().getEmail() : null)
            .createdAt(r.getCreatedAt())
            .updatedAt(r.getUpdatedAt())
            .build();
    }
}
