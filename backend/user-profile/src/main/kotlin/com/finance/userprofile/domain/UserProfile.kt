package com.finance.userprofile.domain

import com.finance.shared.Currency
import com.finance.shared.DisplayLanguage
import com.finance.shared.error.BusinessRuleViolationException
import java.time.LocalDate
import java.util.UUID

data class UserProfile(
    val id: UUID,
    val firstName: String,
    val lastName: String,
    val displayName: String,
    val preferredCurrency: Currency,
    val preferredLanguage: DisplayLanguage,
    val birthDate: LocalDate?,
    val tablePageSize: Int = UserProfilePreferences.DEFAULT_TABLE_PAGE_SIZE,
    val sessionTimeoutMinutes: Int = UserProfilePreferences.DEFAULT_SESSION_TIMEOUT_MINUTES
) {
    init {
        if (firstName.isBlank()) throw BusinessRuleViolationException("First name must not be blank")
        if (lastName.isBlank()) throw BusinessRuleViolationException("Last name must not be blank")
        if (displayName.isBlank()) throw BusinessRuleViolationException("Display name must not be blank")
        UserProfilePreferences.validateTablePageSize(tablePageSize)
        UserProfilePreferences.validateSessionTimeoutMinutes(sessionTimeoutMinutes)
    }
}