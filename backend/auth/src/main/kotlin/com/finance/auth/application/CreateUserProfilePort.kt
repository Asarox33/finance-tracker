package com.finance.auth.application

import com.finance.shared.Currency
import java.time.LocalDate
import java.util.UUID

interface CreateUserProfilePort {
    data class Command(
        val id: UUID,
        val firstName: String,
        val lastName: String,
        val displayName: String,
        val preferredCurrency: Currency,
        val birthDate: LocalDate?
    )
    data class Result(val userId: UUID)
    fun execute(command: Command): Result
}