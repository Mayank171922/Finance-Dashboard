package com.finance.dashboard.service.impl;

import com.finance.dashboard.dto.request.FinancialRecordRequest;
import com.finance.dashboard.dto.request.RecordFilterRequest;
import com.finance.dashboard.dto.response.FinancialRecordResponse;
import com.finance.dashboard.dto.response.PagedResponse;
import com.finance.dashboard.entity.FinancialRecord;
import com.finance.dashboard.entity.User;
import com.finance.dashboard.exception.ResourceNotFoundException;
import com.finance.dashboard.repository.FinancialRecordRepository;
import com.finance.dashboard.repository.UserRepository;
import com.finance.dashboard.service.FinancialRecordService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class FinancialRecordServiceImpl implements FinancialRecordService {

    private final FinancialRecordRepository recordRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<FinancialRecordResponse> getRecords(RecordFilterRequest filter) {
        Sort sort = filter.getSortDir().equalsIgnoreCase("asc")
            ? Sort.by(filter.getSortBy()).ascending()
            : Sort.by(filter.getSortBy()).descending();

        Pageable pageable = PageRequest.of(
            filter.getPage(),
            Math.min(filter.getSize(), 100),
            sort
        );

        Page<FinancialRecordResponse> page = recordRepository.findWithFilters(
            filter.getType(),
            StringUtils.hasText(filter.getCategory()) ? filter.getCategory() : null,
            filter.getFromDate(),
            filter.getToDate(),
            StringUtils.hasText(filter.getSearch()) ? filter.getSearch() : null,
            pageable
        ).map(FinancialRecordResponse::from);

        return PagedResponse.from(page);
    }

    @Override
    @Transactional(readOnly = true)
    public FinancialRecordResponse getRecordById(Long id) {
        return FinancialRecordResponse.from(findActive(id));
    }

    @Override
    @Transactional
    public FinancialRecordResponse createRecord(FinancialRecordRequest request, String creatorEmail) {
        User creator = userRepository.findByEmail(creatorEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + creatorEmail));

        FinancialRecord record = FinancialRecord.builder()
            .amount(request.getAmount())
            .type(request.getType())
            .category(request.getCategory().trim())
            .transactionDate(request.getTransactionDate())
            .notes(request.getNotes())
            .createdBy(creator)
            .build();

        recordRepository.save(record);
        log.info("Created financial record id={} by {}", record.getId(), creatorEmail);
        return FinancialRecordResponse.from(record);
    }

    @Override
    @Transactional
    public FinancialRecordResponse updateRecord(Long id, FinancialRecordRequest request) {
        FinancialRecord record = findActive(id);
        record.setAmount(request.getAmount());
        record.setType(request.getType());
        record.setCategory(request.getCategory().trim());
        record.setTransactionDate(request.getTransactionDate());
        record.setNotes(request.getNotes());
        recordRepository.save(record);
        log.info("Updated financial record id={}", id);
        return FinancialRecordResponse.from(record);
    }

    @Override
    @Transactional
    public void deleteRecord(Long id) {
        FinancialRecord record = findActive(id);
        record.setDeletedAt(LocalDateTime.now()); // soft delete
        recordRepository.save(record);
        log.info("Soft-deleted financial record id={}", id);
    }



    private FinancialRecord findActive(Long id) {
        FinancialRecord r = recordRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Financial record", id));
        if (r.isDeleted()) {
            throw new ResourceNotFoundException("Financial record", id);
        }
        return r;
    }
}
