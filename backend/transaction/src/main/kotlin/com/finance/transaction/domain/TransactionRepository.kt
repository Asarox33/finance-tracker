package com.finance.transaction.domain

import java.time.LocalDate
import java.util.UUID

interface TransactionRepository {
    fun save(transaction: Transaction): Transaction
    fun findById(id: UUID): Transaction?
    fun findByAccountId(accountId: UUID, page: Int, pageSize: Int): List<Transaction>
    fun countByAccountId(accountId: UUID): Long
    fun findByAccountIdAndDateBetween(
        accountId: UUID,
        from: LocalDate,
        to: LocalDate,
        page: Int,
        pageSize: Int
    ): List<Transaction>
    fun countByAccountIdAndDateBetween(accountId: UUID, from: LocalDate, to: LocalDate): Long
}