package com.finance.dashboard.dto.request;

import com.finance.dashboard.entity.TransactionType;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
public class RecordFilterRequest {

    private TransactionType type;
    private String category;
    private String search;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate fromDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate toDate;

    private int page = 0;
    private int size = 10;
    private String sortBy = "transactionDate";
    private String sortDir = "desc";
}
