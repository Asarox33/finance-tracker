package com.finance.auth.infrastructure

import com.finance.auth.application.SessionTimeoutPort
import com.finance.userprofile.application.GetUserProfile
import com.finance.userprofile.domain.UserProfilePreferences
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class SessionTimeoutAdapter(
    private val getUserProfile: GetUserProfile
) : SessionTimeoutPort {
    override fun getSessionTimeoutMinutes(userId: UUID): Int {
        val profile = getUserProfile.execute(userId)
        return profile.sessionTimeoutMinutes.coerceIn(
            UserProfilePreferences.MIN_SESSION_TIMEOUT_MINUTES,
            UserProfilePreferences.MAX_SESSION_TIMEOUT_MINUTES
        )
    }
}
