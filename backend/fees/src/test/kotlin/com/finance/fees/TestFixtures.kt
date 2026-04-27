package com.finance.fees

import com.finance.fees.domain.Fee
import com.finance.fees.domain.FeeRepository
import com.finance.fees.domain.FeeType
import com.finance.shared.Currency
import java.time.LocalDate
import java.util.UUID

class InMemoryFeeRepository : FeeRepository {
    private val store = mutableMapOf<UUID, Fee>()
    override fun save(fee: Fee): Fee { store[fee.id] = fee; return fee }
    override fun findById(id: UUID): Fee? = store[id]
    override fun findByAccountId(accountId: UUID, page: Int, pageSize: Int): List<Fee> =
        store.values.filter { it.accountId == accountId }.drop(page * pageSize).take(pageSize)
    override fun countByAccountId(accountId: UUID): Long =
        store.values.count { it.accountId == accountId }.toLong()
    override fun findByTransactionId(transactionId: UUID): List<Fee> =
        store.values.filter { it.transactionId == transactionId }
}

fun testFee(
    id: UUID = UUID.randomUUID(),
    accountId: UUID? = UUID.randomUUID(),
    transactionId: UUID? = null,
    type: FeeType = FeeType.BROKERAGE,
    amount: Long = 199L,
    currency: Currency = Currency.EUR,
    date: LocalDate = LocalDate.of(2024, 1, 15),
    label: String = "Brokerage fee"
) = Fee(id, accountId, transactionId, type, amount, currency, date, label)