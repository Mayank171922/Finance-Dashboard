package com.finance.dashboard.service;

import com.finance.dashboard.dto.response.DashboardSummaryResponse;
import com.finance.dashboard.dto.response.DashboardSummaryResponse.CategoryTotal;
import com.finance.dashboard.dto.response.DashboardSummaryResponse.MonthlyTrend;
import com.finance.dashboard.dto.response.FinancialRecordResponse;
import com.finance.dashboard.entity.TransactionType;
import com.finance.dashboard.repository.FinancialRecordRepository;
import com.finance.dashboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final FinancialRecordRepository recordRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary() {


        BigDecimal totalIncome   = recordRepository.sumByType(TransactionType.INCOME);
        BigDecimal totalExpenses = recordRepository.sumByType(TransactionType.EXPENSE);
        BigDecimal netBalance    = totalIncome.subtract(totalExpenses);


        LocalDate monthStart = LocalDate.now().withDayOfMonth(1);
        LocalDate monthEnd   = LocalDate.now();

        BigDecimal monthlyIncome   = recordRepository.sumByTypeAndDateRange(TransactionType.INCOME,   monthStart, monthEnd);
        BigDecimal monthlyExpenses = recordRepository.sumByTypeAndDateRange(TransactionType.EXPENSE, monthStart, monthEnd);
        BigDecimal monthlyNet      = monthlyIncome.subtract(monthlyExpenses);

        List<CategoryTotal> categoryTotals = recordRepository.categoryTotals().stream()
            .map(row -> CategoryTotal.builder()
                .category((String) row[0])
                .type(row[1].toString())
                .total((BigDecimal) row[2])
                .build())
            .collect(Collectors.toList());


        LocalDate twelveMonthsAgo = LocalDate.now().minusMonths(11).withDayOfMonth(1);
        List<Object[]> rawTrends  = recordRepository.monthlyTrends(twelveMonthsAgo);


        Map<String, MonthlyTrend> trendMap = new LinkedHashMap<>();
        for (Object[] row : rawTrends) {
            int year  = ((Number) row[0]).intValue();
            int month = ((Number) row[1]).intValue();
            String key = year + "-" + String.format("%02d", month);

            trendMap.putIfAbsent(key, MonthlyTrend.builder()
                .year(year)
                .month(month)
                .monthLabel(Month.of(month).getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + year)
                .income(BigDecimal.ZERO)
                .expenses(BigDecimal.ZERO)
                .net(BigDecimal.ZERO)
                .build());

            MonthlyTrend trend   = trendMap.get(key);
            BigDecimal amount    = (BigDecimal) row[2];
            String type          = row[1].toString(); // reuse slot — actually TransactionType


        }

        // Rebuild with correct 4-column query result
        trendMap.clear();
        for (Object[] row : rawTrends) {
            int year   = ((Number) row[0]).intValue();
            int month  = ((Number) row[1]).intValue();
            String typeStr = row[2].toString();
            BigDecimal amount = (BigDecimal) row[3];
            String key = year + "-" + String.format("%02d", month);

            trendMap.putIfAbsent(key, MonthlyTrend.builder()
                .year(year).month(month)
                .monthLabel(Month.of(month).getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + year)
                .income(BigDecimal.ZERO).expenses(BigDecimal.ZERO).net(BigDecimal.ZERO)
                .build());

            MonthlyTrend trend = trendMap.get(key);
            if ("INCOME".equals(typeStr)) {
                trend.setIncome(trend.getIncome().add(amount));
            } else {
                trend.setExpenses(trend.getExpenses().add(amount));
            }
            trend.setNet(trend.getIncome().subtract(trend.getExpenses()));
        }

        List<MonthlyTrend> monthlyTrends = new ArrayList<>(trendMap.values());


        List<FinancialRecordResponse> recentActivity = recordRepository
            .findRecentActivity(PageRequest.of(0, 10))
            .stream()
            .map(FinancialRecordResponse::from)
            .collect(Collectors.toList());


        long totalUsers  = userRepository.count();
        long activeUsers = userRepository.countByActiveTrue();
        long totalRecords = recordRepository.countByDeletedAtIsNull();

        return DashboardSummaryResponse.builder()
            .totalIncome(totalIncome)
            .totalExpenses(totalExpenses)
            .netBalance(netBalance)
            .monthlyIncome(monthlyIncome)
            .monthlyExpenses(monthlyExpenses)
            .monthlyNetBalance(monthlyNet)
            .categoryTotals(categoryTotals)
            .monthlyTrends(monthlyTrends)
            .recentActivity(recentActivity)
            .totalRecords(totalRecords)
            .totalUsers(totalUsers)
            .activeUsers(activeUsers)
            .build();
    }
}
