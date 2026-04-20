package com.finance.auth.infrastructure

import com.finance.auth.domain.User
import com.finance.auth.domain.UserRepository
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class UserRepositoryAdapter(
    private val jpaUserRepository: JpaUserRepository
) : UserRepository {

    override fun save(user: User): User {
        val entity = jpaUserRepository.findById(user.id).orElse(null)
            ?.also {
                it.email = user.email
                it.passwordHash = user.passwordHash
                it.active = user.active
                it.failedLoginAttempts = user.failedLoginAttempts
                it.lastFailedLoginAt = user.lastFailedLoginAt
            }
            ?: JpaUserEntity(
                id = user.id,
                email = user.email,
                passwordHash = user.passwordHash,
                active = user.active,
                failedLoginAttempts = user.failedLoginAttempts,
                lastFailedLoginAt = user.lastFailedLoginAt
            )
        return jpaUserRepository.save(entity).toDomain()
    }

    override fun findByEmail(email: String): User? =
        jpaUserRepository.findByEmail(email)?.toDomain()

    override fun findById(id: UUID): User? =
        jpaUserRepository.findById(id).orElse(null)?.toDomain()

    override fun existsByEmail(email: String): Boolean =
        jpaUserRepository.existsByEmail(email)
}

private fun JpaUserEntity.toDomain(): User = User(
    id = id,
    email = email,
    passwordHash = passwordHash,
    active = active,
    failedLoginAttempts = failedLoginAttempts,
    lastFailedLoginAt = lastFailedLoginAt
)