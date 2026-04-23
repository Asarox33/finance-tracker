package com.finance.account.application

import com.finance.account.domain.Account
import com.finance.account.domain.AccountRepository
import com.finance.account.domain.AccountStatus
import com.finance.account.domain.AccountType
import com.finance.shared.Currency
import com.finance.shared.error.InvalidRequestException
import java.util.UUID

class CreateAccount(
    private val accountRepository: AccountRepository
) {
    data class Command(
        val userId: UUID,
        val institutionId: UUID,
        val name: String,
        val type: AccountType,
        val currency: Currency
    )

    data class Result(val accountId: UUID)

    fun execute(command: Command): Result {
        if (command.name.isBlank()) throw InvalidRequestException("Account name must not be blank")
        val account = Account(
            id = UUID.randomUUID(),
            userId = command.userId,
            institutionId = command.institutionId,
            name = command.name,
            type = command.type,
            currency = command.currency,
            status = AccountStatus.ACTIVE
        )
        return Result(accountId = accountRepository.save(account).id)
    }
}