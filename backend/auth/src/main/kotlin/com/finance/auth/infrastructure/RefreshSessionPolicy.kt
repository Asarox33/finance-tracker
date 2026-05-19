package com.finance.auth.infrastructure

import com.finance.userprofile.domain.UserProfilePreferences
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.time.Duration

@Component
class RefreshSessionPolicy(
    @Value("\${auth.refresh.expiration-ms}")
    refreshExpirationMs: Long
) {
    private val logger = LoggerFactory.getLogger("com.finance.auth.infrastructure.RefreshSessionPolicy")

    val effectiveRefreshExpirationMs: Long =
        if (refreshExpirationMs > MAX_REFRESH_EXPIRATION_MS) {
            MAX_REFRESH_EXPIRATION_MS
        } else {
            refreshExpirationMs
        }

    init {
        if (refreshExpirationMs > MAX_REFRESH_EXPIRATION_MS) {
            logger.warn(
                "auth.refresh.expiration-ms ({}) exceeds maximum ({}); using {}",
                refreshExpirationMs,
                MAX_REFRESH_EXPIRATION_MS,
                effectiveRefreshExpirationMs
            )
        }
    }

    fun effectiveRefreshTtl(): Duration = Duration.ofMillis(effectiveRefreshExpirationMs)

    fun effectiveRefreshTtl(sessionTimeoutMinutes: Int): Duration {
        val clampedMinutes = sessionTimeoutMinutes.coerceIn(
            UserProfilePreferences.MIN_SESSION_TIMEOUT_MINUTES,
            UserProfilePreferences.MAX_SESSION_TIMEOUT_MINUTES
        )
        val ms = clampedMinutes * 60_000L
        return Duration.ofMillis(ms.coerceAtMost(MAX_REFRESH_EXPIRATION_MS))
    }

    companion object {
        const val MAX_REFRESH_EXPIRATION_MS: Long = 900_000L
    }
}
