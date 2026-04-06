package com.finance.dashboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardSummaryResponse {


    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal netBalance;


    private BigDecimal monthlyIncome;
    private BigDecimal monthlyExpenses;
    private BigDecimal monthlyNetBalance;


    private List<CategoryTotal> categoryTotals;


    private List<MonthlyTrend> monthlyTrends;


    private List<FinancialRecordResponse> recentActivity;


    private long totalRecords;
    private long totalUsers;
    private long activeUsers;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CategoryTotal {
        private String category;
        private String type;
        private BigDecimal total;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class MonthlyTrend {
        private int year;
        private int month;
        private String monthLabel;
        private BigDecimal income;
        private BigDecimal expenses;
        private BigDecimal net;
    }
}
