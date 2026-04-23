package com.finance.account.application

import com.finance.account.domain.Account
import com.finance.account.domain.AccountRepository
import com.finance.shared.PageResult
import java.util.UUID

class ListUserAccounts(
    private val accountRepository: AccountRepository
) {
    data class Query(
        val userId: UUID,
        val page: Int = 0,
        val pageSize: Int = 20
    )

    fun execute(query: Query): PageResult<Account> {
        val items = accountRepository.findByUserId(query.userId, query.page, query.pageSize)
        val total = accountRepository.countByUserId(query.userId)
        return PageResult.of(items, query.page, query.pageSize, total)
    }
}