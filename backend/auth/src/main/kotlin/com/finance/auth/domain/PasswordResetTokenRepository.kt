package com.finance.auth.domain

import java.util.UUID

interface PasswordResetTokenRepository {
    fun save(token: PasswordResetToken): PasswordResetToken
    fun findByUserIdAndOtpHash(userId: UUID, otpHash: String): PasswordResetToken?
    fun invalidateAllForUser(userId: UUID)
}