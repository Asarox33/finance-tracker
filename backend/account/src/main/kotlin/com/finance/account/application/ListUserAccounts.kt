package com.finance.account.application

import com.finance.account.domain.Account
import com.finance.account.domain.AccountRepository
import com.finance.account.domain.AccountStatus
import com.finance.account.domain.AccountType
import com.finance.shared.PageResult
import java.util.UUID

class ListUserAccounts(
    private val accountRepository: AccountRepository
) {
    data class Query(
        val userId: UUID,
        val page: Int = 0,
        val pageSize: Int = 20,
        val includeClosed: Boolean = true,
        val type: AccountType? = null
    )

    fun execute(query: Query): PageResult<Account> {
        val items = if (query.includeClosed) {
            accountRepository.findByUserId(query.userId, query.page, query.pageSize, query.type)
        } else {
            accountRepository.findByUserIdAndStatus(
                query.userId,
                AccountStatus.ACTIVE,
                query.page,
                query.pageSize,
                query.type
            )
        }
        val total = if (query.includeClosed) {
            accountRepository.countByUserId(query.userId, query.type)
        } else {
            accountRepository.countByUserIdAndStatus(query.userId, AccountStatus.ACTIVE, query.type)
        }
        return PageResult.of(items, query.page, query.pageSize, total)
    }
}