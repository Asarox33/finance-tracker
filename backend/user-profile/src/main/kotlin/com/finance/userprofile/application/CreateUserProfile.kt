package com.finance.userprofile.application

import com.finance.shared.Currency
import com.finance.shared.DisplayLanguage
import com.finance.shared.error.InvalidRequestException
import com.finance.userprofile.domain.UserProfile
import com.finance.userprofile.domain.UserProfileRepository
import java.time.LocalDate
import java.util.UUID

class CreateUserProfile(
    private val userProfileRepository: UserProfileRepository
) {
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

    fun execute(command: Command): Result {
        if (userProfileRepository.findById(command.id) != null) {
            throw InvalidRequestException("User profile already exists: ${command.id}")
        }
        val profile = UserProfile(
            id = command.id,
            firstName = command.firstName,
            lastName = command.lastName,
            displayName = command.displayName,
            preferredCurrency = command.preferredCurrency,
            preferredLanguage = command.preferredLanguage,
            birthDate = command.birthDate
        )
        return Result(userId = userProfileRepository.save(profile).id)
    }
}