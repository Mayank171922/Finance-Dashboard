package com.finance.dashboard.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Core financial record entity (a.k.a. transaction entry).
 *
 * Design decisions:
 *  - amount uses BigDecimal for precise decimal arithmetic (never float/double for money)
 *  - transactionDate is a LocalDate (day granularity is sufficient; time-of-day is noise for finance reports)
 *  - category is a free-text String to allow flexible categorisation without a rigid enum list
 *  - Soft-delete via deletedAt timestamp; null means the record is alive
 *  - ManyToOne to User records who created the entry (audit trail)
 */
@Entity
@Table(
    name = "financial_records",
    indexes = {
        @Index(name = "idx_record_type",     columnList = "type"),
        @Index(name = "idx_record_category", columnList = "category"),
        @Index(name = "idx_record_date",     columnList = "transactionDate"),
        @Index(name = "idx_record_deleted",  columnList = "deletedAt")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TransactionType type;          // INCOME | EXPENSE

    @Column(nullable = false, length = 100)
    private String category;               // e.g. "Salary", "Rent", "Groceries"

    @Column(nullable = false)
    private LocalDate transactionDate;

    @Column(length = 500)
    private String notes;


    @Column
    private LocalDateTime deletedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /** Convenience helper — does not touch deletedAt directly. */
    public boolean isDeleted() {
        return this.deletedAt != null;
    }
}
