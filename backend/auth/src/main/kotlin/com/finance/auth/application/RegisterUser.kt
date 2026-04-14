package com.finance.auth.application

import com.finance.auth.domain.User
import com.finance.auth.domain.UserRepository
import com.finance.shared.error.InvalidRequestException
import java.util.UUID

class RegisterUser(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder
) {
    data class Command(val email: String, val rawPassword: String)
    data class Result(val userId: UUID)

    fun execute(command: Command): Result {
        if (command.email.isBlank()) throw InvalidRequestException("Email must not be blank")
        if (command.rawPassword.isBlank()) throw InvalidRequestException("Password must not be blank")
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
        return Result(userId = saved.id)
    }
}