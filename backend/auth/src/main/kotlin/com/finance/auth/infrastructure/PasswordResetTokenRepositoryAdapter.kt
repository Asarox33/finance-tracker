package com.finance.auth.infrastructure

import com.finance.auth.application.PasswordEncoder
import com.finance.auth.domain.PasswordResetToken
import com.finance.auth.domain.PasswordResetTokenRepository
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class PasswordResetTokenRepositoryAdapter(
    private val jpaRepo: JpaPasswordResetTokenSpringRepository,
    private val passwordEncoder: PasswordEncoder
) : PasswordResetTokenRepository {

    override fun save(token: PasswordResetToken): PasswordResetToken {
        val entity = jpaRepo.findById(token.id).orElse(null)
            ?.also {
                it.otpHash = token.otpHash
                it.expiresAt = token.expiresAt
                it.used = token.used
            }
            ?: JpaPasswordResetTokenEntity(
                id = token.id,
                userId = token.userId,
                otpHash = token.otpHash,
                expiresAt = token.expiresAt,
                used = token.used
            )
        jpaRepo.save(entity)
        return token
    }

    override fun findByUserIdAndOtpHash(userId: UUID, otpHash: String): PasswordResetToken? {
        return jpaRepo.findByUserId(userId)
            .filter { !it.used }
            .firstOrNull { passwordEncoder.matches(otpHash, it.otpHash) }
            ?.toDomain()
    }

    override fun invalidateAllForUser(userId: UUID) =
        jpaRepo.invalidateAllForUser(userId)
}

private fun JpaPasswordResetTokenEntity.toDomain() = PasswordResetToken(
    id = id,
    userId = userId,
    otpHash = otpHash,
    expiresAt = expiresAt,
    used = used
)