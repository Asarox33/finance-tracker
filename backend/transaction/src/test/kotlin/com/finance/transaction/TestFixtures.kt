package com.finance.transaction

import com.finance.account.domain.AccountType
import com.finance.shared.Currency
import com.finance.transaction.domain.Transaction
import com.finance.transaction.domain.TransactionRepository
import com.finance.transaction.domain.TransactionStatus
import com.finance.transaction.domain.TransactionType
import com.finance.transaction.domain.ports.AccountAccessPort
import com.finance.transaction.domain.ports.AccountAccessSummary
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
        store.values.filter { it.accountId == accountId && it.status == TransactionStatus.ACTIVE }
            .drop(page * pageSize).take(pageSize)

    override fun countByAccountId(accountId: UUID): Long =
        store.values.count { it.accountId == accountId && it.status == TransactionStatus.ACTIVE }.toLong()

    override fun findByAccountIdAndDateBetween(
        accountId: UUID,
        from: LocalDate,
        to: LocalDate,
        page: Int,
        pageSize: Int
    ): List<Transaction> = store.values
        .filter {
            it.accountId == accountId &&
                it.status == TransactionStatus.ACTIVE &&
                !it.date.isBefore(from) &&
                !it.date.isAfter(to)
        }
        .drop(page * pageSize).take(pageSize)

    override fun countByAccountIdAndDateBetween(
        accountId: UUID,
        from: LocalDate,
        to: LocalDate
    ): Long = store.values
        .count {
            it.accountId == accountId &&
                it.status == TransactionStatus.ACTIVE &&
                !it.date.isBefore(from) &&
                !it.date.isAfter(to)
        }
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
    notes: String? = null,
    status: TransactionStatus = TransactionStatus.ACTIVE,
    assetQuantityMinor: Long? = null,
    assetQuantityScale: Int? = null
) = Transaction(
    id,
    accountId,
    assetId,
    type,
    amount,
    currency,
    date,
    label,
    notes,
    status,
    assetQuantityMinor = assetQuantityMinor,
    assetQuantityScale = assetQuantityScale
)

class StubAccountAccessPort(
    private val accounts: List<AccountAccessSummary> = emptyList()
) : AccountAccessPort {
    override fun findAccountForUser(accountId: UUID, userId: UUID): AccountAccessSummary? =
        accounts.firstOrNull { it.id == accountId && it.userId == userId }
}

fun accountAccessSummary(
    id: UUID = UUID.randomUUID(),
    userId: UUID = UUID.randomUUID(),
    type: AccountType = AccountType.CHECKING,
    currency: Currency = Currency.EUR,
    active: Boolean = true
) = AccountAccessSummary(id, userId, type, currency, active)