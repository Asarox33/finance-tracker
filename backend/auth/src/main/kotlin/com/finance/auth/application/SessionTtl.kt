package com.finance.auth.application

import com.finance.userprofile.domain.UserProfilePreferences
import java.time.Duration

object SessionTtl {
    const val MAX_SESSION_MS: Long = 900_000L

    fun fromMinutes(sessionTimeoutMinutes: Int): Duration {
        val clamped = sessionTimeoutMinutes.coerceIn(
            UserProfilePreferences.MIN_SESSION_TIMEOUT_MINUTES,
            UserProfilePreferences.MAX_SESSION_TIMEOUT_MINUTES
        )
        val ms = clamped * 60_000L
        return Duration.ofMillis(ms.coerceAtMost(MAX_SESSION_MS))
    }
}
