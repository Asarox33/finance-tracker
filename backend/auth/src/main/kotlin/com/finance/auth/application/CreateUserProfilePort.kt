package com.finance.auth.application

import com.finance.shared.Currency
import com.finance.shared.DisplayLanguage
import java.time.LocalDate
import java.util.UUID

interface CreateUserProfilePort {
    data class Command(
        val id: UUID,
        val firstName: String,
        val lastName: String,
        val displayName: String,
        val preferredCurrency: Currency,
        val preferredLanguage: DisplayLanguage,
        val birthDate: LocalDate?
    )
    data class Result(val userId: UUID)
    fun execute(command: Command): Result
}