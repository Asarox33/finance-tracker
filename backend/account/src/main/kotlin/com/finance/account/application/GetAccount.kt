package com.finance.account.application

import com.finance.account.domain.Account
import com.finance.account.domain.AccountRepository
import com.finance.shared.error.NotFoundException
import java.util.UUID

class GetAccount(
    private val accountRepository: AccountRepository
) {
    fun execute(accountId: UUID): Account =
        accountRepository.findById(accountId)
            ?: throw NotFoundException("Account not found: $accountId")
}