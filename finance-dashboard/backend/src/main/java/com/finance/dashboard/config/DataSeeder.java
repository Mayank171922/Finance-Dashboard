package com.finance.dashboard.config;

import com.finance.dashboard.entity.FinancialRecord;
import com.finance.dashboard.entity.Role;
import com.finance.dashboard.entity.TransactionType;
import com.finance.dashboard.entity.User;
import com.finance.dashboard.repository.FinancialRecordRepository;
import com.finance.dashboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    private final UserRepository userRepository;
    private final FinancialRecordRepository recordRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner seedData() {
        return args -> {
            if (userRepository.count() > 0) {
                log.info("Database already seeded, skipping.");
                return;
            }

            log.info("Seeding initial data...");


            User admin = userRepository.save(User.builder()
                .fullName("Admin User")
                .email("admin@finance.com")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN).active(true).build());

            User analyst = userRepository.save(User.builder()
                .fullName("Alice Analyst")
                .email("analyst@finance.com")
                .password(passwordEncoder.encode("analyst123"))
                .role(Role.ANALYST).active(true).build());

            userRepository.save(User.builder()
                .fullName("Victor Viewer")
                .email("viewer@finance.com")
                .password(passwordEncoder.encode("viewer123"))
                .role(Role.VIEWER).active(true).build());

            LocalDate today = LocalDate.now();

            // Income records
            String[][] incomeData = {
                {"Salary",           "85000.00", "-1"},
                {"Freelance",        "12000.00", "-2"},
                {"Investment Return","5500.00",  "-1"},
                {"Salary",           "85000.00", "-2"},
                {"Consulting",       "8000.00",  "-3"},
                {"Salary",           "85000.00", "-3"},
                {"Bonus",            "15000.00", "-4"},
                {"Freelance",        "9000.00",  "-4"},
                {"Salary",           "85000.00", "-5"},
                {"Dividend",         "3200.00",  "-5"},
                {"Salary",           "85000.00", "-6"},
                {"Rental Income",    "24000.00", "-6"},
            };
            for (String[] d : incomeData) {
                recordRepository.save(FinancialRecord.builder()
                    .amount(new BigDecimal(d[1]))
                    .type(TransactionType.INCOME)
                    .category(d[0])
                    .transactionDate(today.plusMonths(Long.parseLong(d[2])).withDayOfMonth(1))
                    .notes("Monthly " + d[0].toLowerCase())
                    .createdBy(admin).build());
            }

            // Expense records
            String[][] expenseData = {
                {"Rent",         "25000.00", "-1"},
                {"Groceries",    "8500.00",  "-1"},
                {"Utilities",    "3200.00",  "-1"},
                {"Transport",    "4500.00",  "-1"},
                {"Rent",         "25000.00", "-2"},
                {"Groceries",    "7800.00",  "-2"},
                {"Healthcare",   "12000.00", "-2"},
                {"Utilities",    "3000.00",  "-2"},
                {"Rent",         "25000.00", "-3"},
                {"Entertainment","5000.00",  "-3"},
                {"Groceries",    "9200.00",  "-3"},
                {"Rent",         "25000.00", "-4"},
                {"Education",    "15000.00", "-4"},
                {"Groceries",    "8100.00",  "-4"},
                {"Rent",         "25000.00", "-5"},
                {"Insurance",    "6500.00",  "-5"},
                {"Groceries",    "7500.00",  "-5"},
                {"Rent",         "25000.00", "-6"},
                {"Travel",       "18000.00", "-6"},
                {"Groceries",    "8800.00",  "-6"},
            };
            for (String[] d : expenseData) {
                recordRepository.save(FinancialRecord.builder()
                    .amount(new BigDecimal(d[1]))
                    .type(TransactionType.EXPENSE)
                    .category(d[0])
                    .transactionDate(today.plusMonths(Long.parseLong(d[2])).withDayOfMonth(15))
                    .notes(d[0] + " payment")
                    .createdBy(admin).build());
            }

            log.info("✅ Seeded 3 users and {} financial records.", incomeData.length + expenseData.length);
            log.info("Default credentials:");
            log.info("  admin@finance.com   / admin123   (ADMIN)");
            log.info("  analyst@finance.com / analyst123 (ANALYST)");
            log.info("  viewer@finance.com  / viewer123  (VIEWER)");
        };
    }
}
