package com.finance.auth

import com.finance.auth.application.PasswordEncoder
import com.finance.auth.application.TokenIssuer
import com.finance.auth.domain.AuthToken
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

class PlainPasswordEncoder : PasswordEncoder {
    override fun encode(raw: String): String = raw
    override fun matches(raw: String, encoded: String): Boolean = raw == encoded
}

class FixedTokenIssuer : TokenIssuer {
    override fun issue(userId: UUID): AuthToken = AuthToken("fixed-token", userId)
}