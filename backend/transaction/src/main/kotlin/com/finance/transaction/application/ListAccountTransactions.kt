package com.finance.transaction.application

import com.finance.shared.PageResult
import com.finance.shared.error.NotFoundException
import com.finance.transaction.domain.Transaction
import com.finance.transaction.domain.TransactionRepository
import com.finance.transaction.domain.ports.AccountAccessPort
import java.time.LocalDate
import java.util.UUID

class ListAccountTransactions(
    private val transactionRepository: TransactionRepository,
    private val accountAccessPort: AccountAccessPort
) {
    data class Query(
        val requestingUserId: UUID,
        val accountId: UUID,
        val from: LocalDate? = null,
        val to: LocalDate? = null,
        val page: Int = 0,
        val pageSize: Int = 20
    )

    fun execute(query: Query): PageResult<Transaction> {
        accountAccessPort.findAccountForUser(query.accountId, query.requestingUserId)
            ?: throw NotFoundException("Account not found: ${query.accountId}")
        val from = query.from
        val to = query.to
        return if (from != null && to != null) {
            val items = transactionRepository.findByAccountIdAndDateBetween(
                query.accountId, from, to, query.page, query.pageSize
            )
            val total = transactionRepository.countByAccountIdAndDateBetween(
                query.accountId, from, to
            )
            PageResult.of(items, query.page, query.pageSize, total)
        } else {
            val items = transactionRepository.findByAccountId(
                query.accountId, query.page, query.pageSize
            )
            val total = transactionRepository.countByAccountId(query.accountId)
            PageResult.of(items, query.page, query.pageSize, total)
        }
    }
}