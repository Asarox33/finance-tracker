package com.finance.account.application

import com.finance.account.domain.AccountRepository
import com.finance.shared.error.InvalidRequestException
import com.finance.shared.error.NotFoundException
import java.util.UUID

class CloseAccount(
    private val accountRepository: AccountRepository
) {
    data class Command(val accountId: UUID, val requestingUserId: UUID)

    fun execute(command: Command) {
        val account = accountRepository.findById(command.accountId)
            ?: throw NotFoundException("Account not found: ${command.accountId}")
        if (account.userId != command.requestingUserId) {
            throw InvalidRequestException("Account does not belong to user: ${command.requestingUserId}")
        }
        accountRepository.save(account.close())
    }
}