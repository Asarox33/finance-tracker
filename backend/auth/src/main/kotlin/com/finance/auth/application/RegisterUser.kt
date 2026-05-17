package com.finance.auth.application

import com.finance.auth.domain.User
import com.finance.auth.domain.UserRepository
import com.finance.shared.Currency
import com.finance.shared.DisplayLanguage
import com.finance.shared.error.InvalidRequestException
import com.finance.shared.validation.PasswordPolicy
import java.util.UUID

class RegisterUser(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val createUserProfile: CreateUserProfilePort
) {
    data class Command(val email: String, val rawPassword: String)
    data class Result(val userId: UUID)

    fun execute(command: Command): Result {
        if (command.email.isBlank()) throw InvalidRequestException("Email must not be blank")
        if (command.email.length > 255) throw InvalidRequestException("Email must not exceed 255 characters")
        if (command.rawPassword.isBlank()) throw InvalidRequestException("Password must not be blank")

        val passwordErrors = PasswordPolicy.validate(command.rawPassword)
        if (passwordErrors.isNotEmpty()) throw InvalidRequestException(passwordErrors.joinToString(", "))

        if (userRepository.existsByEmail(command.email)) {
            throw InvalidRequestException("Email already registered: ${command.email}")
        }

        val user = User(
            id = UUID.randomUUID(),
            email = command.email,
            passwordHash = passwordEncoder.encode(command.rawPassword),
            active = true
        )
        val saved = userRepository.save(user)

        createUserProfile.execute(
            CreateUserProfilePort.Command(
                id = saved.id,
                firstName = "Unknown",
                lastName = "Unknown",
                displayName = "New user",
                preferredCurrency = Currency.USD,
                preferredLanguage = DisplayLanguage.ENG,
                birthDate = null
            )
        )

        return Result(userId = saved.id)
    }
}