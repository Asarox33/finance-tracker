package com.finance.userprofile.application

import com.finance.shared.Currency
import com.finance.shared.DisplayLanguage
import com.finance.shared.error.InvalidRequestException
import com.finance.shared.error.NotFoundException
import com.finance.userprofile.domain.UserProfile
import com.finance.userprofile.domain.UserProfilePreferences
import com.finance.userprofile.domain.UserProfileRepository
import java.time.LocalDate
import java.util.UUID

class UpdateUserPreferences(
    private val userProfileRepository: UserProfileRepository
) {
    data class Command(
        val userId: UUID,
        val firstName: String,
        val lastName: String,
        val displayName: String,
        val preferredCurrency: Currency,
        val preferredLanguage: DisplayLanguage,
        val birthDate: LocalDate?,
        val tablePageSize: Int,
        val sessionTimeoutMinutes: Int
    )

    fun execute(command: Command): UserProfile {
        if (command.firstName.isBlank()) throw InvalidRequestException("First name must not be blank")
        if (command.lastName.isBlank()) throw InvalidRequestException("Last name must not be blank")
        if (command.displayName.isBlank()) throw InvalidRequestException("Display name must not be blank")
        UserProfilePreferences.validateTablePageSize(command.tablePageSize)
        UserProfilePreferences.validateSessionTimeoutMinutes(command.sessionTimeoutMinutes)

        val profile = userProfileRepository.findById(command.userId)
            ?: throw NotFoundException("User profile not found: ${command.userId}")

        return userProfileRepository.save(
            profile.copy(
                firstName = command.firstName,
                lastName = command.lastName,
                displayName = command.displayName,
                preferredCurrency = command.preferredCurrency,
                preferredLanguage = command.preferredLanguage,
                birthDate = command.birthDate,
                tablePageSize = command.tablePageSize,
                sessionTimeoutMinutes = command.sessionTimeoutMinutes
            )
        )
    }
}
