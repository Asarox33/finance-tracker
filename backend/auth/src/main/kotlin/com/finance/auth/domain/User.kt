package com.finance.auth.domain

import com.finance.shared.error.BusinessRuleViolationException
import java.time.Instant
import java.util.UUID

data class User(
    val id: UUID,
    val email: String,
    val passwordHash: String,
    val active: Boolean,
    val failedLoginAttempts: Int = 0,
    val lastFailedLoginAt: Instant? = null
) {
    init {
        if (email.isBlank()) throw BusinessRuleViolationException("Email must not be blank")
        if (passwordHash.isBlank()) throw BusinessRuleViolationException("Password hash must not be blank")
        if (failedLoginAttempts < 0) throw BusinessRuleViolationException("Failed login attempts must be non-negative")
    }

    fun canAttemptLogin(now: Instant, cooldownSeconds: Long = 900): Boolean {
        if (active) return true
        val last = lastFailedLoginAt ?: return false
        return now.isAfter(last.plusSeconds(cooldownSeconds))
    }

    fun recordFailedLogin(now: Instant): User {
        val updated = copy(
            failedLoginAttempts = failedLoginAttempts + 1,
            lastFailedLoginAt = now
        )
        return if (updated.failedLoginAttempts >= 3) updated.copy(active = false) else updated
    }

    fun recordSuccessfulLogin(): User =
        copy(failedLoginAttempts = 0, lastFailedLoginAt = null)
}