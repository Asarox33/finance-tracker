package com.finance.auth

import com.finance.auth.application.CreateUserProfilePort
import com.finance.auth.application.EmailSender
import com.finance.auth.application.OtpGenerator
import com.finance.auth.application.PasswordEncoder
import com.finance.auth.application.TokenIssuer
import com.finance.auth.domain.AuthToken
import com.finance.auth.domain.PasswordResetToken
import com.finance.auth.domain.PasswordResetTokenRepository
import com.finance.auth.domain.User
import com.finance.auth.domain.UserRepository
import java.util.UUID

class InMemoryUserRepository : UserRepository {
    private val store = mutableMapOf<UUID, User>()
    override fun save(user: User): User { store[user.id] = user; return user }
    override fun findByEmail(email: String): User? = store.values.find { it.email == email }
    override fun findById(id: UUID): User? = store[id]
    override fun existsByEmail(email: String): Boolean = store.values.any { it.email == email }
}

class InMemoryPasswordResetTokenRepository : PasswordResetTokenRepository {
    val store = mutableMapOf<UUID, PasswordResetToken>()
    override fun save(token: PasswordResetToken): PasswordResetToken { store[token.id] = token; return token }
    override fun findByUserIdAndOtpHash(userId: UUID, rawOtp: String): PasswordResetToken? =
        store.values.firstOrNull { it.userId == userId && it.otpHash == rawOtp && !it.used }
    override fun invalidateAllForUser(userId: UUID) {
        store.entries.filter { it.value.userId == userId }.forEach { store[it.key] = it.value.copy(used = true) }
    }
}

class PlainPasswordEncoder : PasswordEncoder {
    override fun encode(raw: String): String = raw
    override fun matches(raw: String, encoded: String): Boolean = raw == encoded
}

class FixedTokenIssuer : TokenIssuer {
    override fun issue(userId: UUID): AuthToken = AuthToken("fixed-token", userId)
}

class FixedOtpGenerator(private val otp: String = "123456") : OtpGenerator {
    override fun generate(): String = otp
}

class NoOpEmailSender : EmailSender {
    val sent = mutableListOf<Triple<String, String, String>>()
    override fun send(to: String, subject: String, body: String) { sent.add(Triple(to, subject, body)) }
}

class NoOpCreateUserProfilePort : CreateUserProfilePort {
    val created = mutableListOf<CreateUserProfilePort.Command>()
    override fun execute(command: CreateUserProfilePort.Command): CreateUserProfilePort.Result {
        created.add(command)
        return CreateUserProfilePort.Result(userId = command.id)
    }
}