package com.finance.transaction

import com.finance.shared.Currency
import com.finance.transaction.domain.Transaction
import com.finance.transaction.domain.TransactionRepository
import com.finance.transaction.domain.TransactionType
import java.time.LocalDate
import java.util.UUID

class InMemoryTransactionRepository : TransactionRepository {
    private val store = mutableMapOf<UUID, Transaction>()

    override fun save(transaction: Transaction): Transaction {
        store[transaction.id] = transaction
        return transaction
    }

    override fun findById(id: UUID): Transaction? = store[id]

    override fun findByAccountId(accountId: UUID, page: Int, pageSize: Int): List<Transaction> =
        store.values.filter { it.accountId == accountId }.drop(page * pageSize).take(pageSize)

    override fun countByAccountId(accountId: UUID): Long =
        store.values.count { it.accountId == accountId }.toLong()

    override fun findByAccountIdAndDateBetween(
        accountId: UUID,
        from: LocalDate,
        to: LocalDate,
        page: Int,
        pageSize: Int
    ): List<Transaction> = store.values
        .filter { it.accountId == accountId && !it.date.isBefore(from) && !it.date.isAfter(to) }
        .drop(page * pageSize).take(pageSize)

    override fun countByAccountIdAndDateBetween(
        accountId: UUID,
        from: LocalDate,
        to: LocalDate
    ): Long = store.values
        .count { it.accountId == accountId && !it.date.isBefore(from) && !it.date.isAfter(to) }
        .toLong()
}

fun testTransaction(
    id: UUID = UUID.randomUUID(),
    accountId: UUID = UUID.randomUUID(),
    assetId: UUID? = null,
    type: TransactionType = TransactionType.DEPOSIT,
    amount: Long = 10000L,
    currency: Currency = Currency.EUR,
    date: LocalDate = LocalDate.of(2024, 1, 15),
    label: String = "Monthly salary",
    notes: String? = null
) = Transaction(id, accountId, assetId, type, amount, currency, date, label, notes)