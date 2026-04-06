package com.finance.dashboard.service;

import com.finance.dashboard.dto.request.FinancialRecordRequest;
import com.finance.dashboard.dto.request.RecordFilterRequest;
import com.finance.dashboard.dto.response.FinancialRecordResponse;
import com.finance.dashboard.dto.response.PagedResponse;

public interface FinancialRecordService {
    PagedResponse<FinancialRecordResponse> getRecords(RecordFilterRequest filter);
    FinancialRecordResponse getRecordById(Long id);
    FinancialRecordResponse createRecord(FinancialRecordRequest request, String creatorEmail);
    FinancialRecordResponse updateRecord(Long id, FinancialRecordRequest request);
    void deleteRecord(Long id);   // soft delete
}
