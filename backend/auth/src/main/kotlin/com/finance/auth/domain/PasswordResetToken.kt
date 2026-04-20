package com.finance.auth.domain

import com.finance.shared.error.BusinessRuleViolationException
import java.time.Instant
import java.util.UUID

data class PasswordResetToken(
    val id: UUID,
    val userId: UUID,
    val otpHash: String,
    val expiresAt: Instant,
    val used: Boolean
) {
    init {
        if (otpHash.isBlank()) throw BusinessRuleViolationException("OTP hash must not be blank")
    }

    fun isExpired(now: Instant): Boolean = now.isAfter(expiresAt)
    fun markUsed(): PasswordResetToken = copy(used = true)
}