package com.finance.fees.domain

import java.util.UUID

interface FeeRepository {
    fun save(fee: Fee): Fee
    fun findById(id: UUID): Fee?
    fun findByAccountId(accountId: UUID, page: Int, pageSize: Int): List<Fee>
    fun countByAccountId(accountId: UUID): Long
    fun findByTransactionId(transactionId: UUID): List<Fee>
}