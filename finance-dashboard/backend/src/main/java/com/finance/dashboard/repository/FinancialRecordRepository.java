package com.finance.dashboard.repository;

import com.finance.dashboard.entity.FinancialRecord;
import com.finance.dashboard.entity.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface FinancialRecordRepository extends JpaRepository<FinancialRecord, Long> {



    @Query("""
        SELECT r FROM FinancialRecord r
        WHERE r.deletedAt IS NULL
          AND (:type     IS NULL OR r.type     = :type)
          AND (:category IS NULL OR LOWER(r.category) LIKE LOWER(CONCAT('%', :category, '%')))
          AND (:fromDate IS NULL OR r.transactionDate >= :fromDate)
          AND (:toDate   IS NULL OR r.transactionDate <= :toDate)
          AND (:search   IS NULL
               OR LOWER(r.category) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(r.notes)    LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY r.transactionDate DESC
        """)
    Page<FinancialRecord> findWithFilters(
        @Param("type")     TransactionType type,
        @Param("category") String category,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate")   LocalDate toDate,
        @Param("search")   String search,
        Pageable pageable
    );


    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM FinancialRecord r WHERE r.deletedAt IS NULL AND r.type = :type")
    BigDecimal sumByType(@Param("type") TransactionType type);

    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM FinancialRecord r WHERE r.deletedAt IS NULL AND r.type = :type AND r.transactionDate BETWEEN :from AND :to")
    BigDecimal sumByTypeAndDateRange(
        @Param("type") TransactionType type,
        @Param("from") LocalDate from,
        @Param("to")   LocalDate to
    );

    /** Category-wise totals broken down by type. Returns [category, type, total]. */
    @Query("""
        SELECT r.category, r.type, SUM(r.amount)
        FROM FinancialRecord r
        WHERE r.deletedAt IS NULL
        GROUP BY r.category, r.type
        ORDER BY SUM(r.amount) DESC
        """)
    List<Object[]> categoryTotals();

    /** Monthly aggregation — returns [year, month, type, total]. */
    @Query("""
        SELECT YEAR(r.transactionDate), MONTH(r.transactionDate), r.type, SUM(r.amount)
        FROM FinancialRecord r
        WHERE r.deletedAt IS NULL
          AND r.transactionDate >= :from
        GROUP BY YEAR(r.transactionDate), MONTH(r.transactionDate), r.type
        ORDER BY YEAR(r.transactionDate) ASC, MONTH(r.transactionDate) ASC
        """)
    List<Object[]> monthlyTrends(@Param("from") LocalDate from);

    /** Weekly aggregation — returns [week, type, total] for the last N weeks. */
    @Query("""
        SELECT WEEK(r.transactionDate), r.type, SUM(r.amount)
        FROM FinancialRecord r
        WHERE r.deletedAt IS NULL
          AND r.transactionDate >= :from
        GROUP BY WEEK(r.transactionDate), r.type
        ORDER BY WEEK(r.transactionDate) ASC
        """)
    List<Object[]> weeklyTrends(@Param("from") LocalDate from);

    /** Most recent N active records for the 'recent activity' feed. */
    @Query("SELECT r FROM FinancialRecord r WHERE r.deletedAt IS NULL ORDER BY r.transactionDate DESC, r.createdAt DESC")
    List<FinancialRecord> findRecentActivity(Pageable pageable);

    long countByDeletedAtIsNull();
}
