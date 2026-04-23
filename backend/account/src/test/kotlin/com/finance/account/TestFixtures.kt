package com.finance.account

import com.finance.account.domain.Account
import com.finance.account.domain.AccountRepository
import com.finance.account.domain.AccountStatus
import com.finance.account.domain.AccountType
import com.finance.shared.Currency
import java.util.UUID

class InMemoryAccountRepository : AccountRepository {
    private val store = mutableMapOf<UUID, Account>()
    override fun save(account: Account): Account { store[account.id] = account; return account }
    override fun findById(id: UUID): Account? = store[id]
    override fun findByUserId(userId: UUID, page: Int, pageSize: Int): List<Account> =
        store.values.filter { it.userId == userId }.drop(page * pageSize).take(pageSize)
    override fun countByUserId(userId: UUID): Long =
        store.values.count { it.userId == userId }.toLong()
}

fun testAccount(
    id: UUID = UUID.randomUUID(),
    userId: UUID = UUID.randomUUID(),
    institutionId: UUID = UUID.randomUUID(),
    name: String = "My Account",
    type: AccountType = AccountType.CHECKING,
    currency: Currency = Currency.EUR,
    status: AccountStatus = AccountStatus.ACTIVE
) = Account(id, userId, institutionId, name, type, currency, status)