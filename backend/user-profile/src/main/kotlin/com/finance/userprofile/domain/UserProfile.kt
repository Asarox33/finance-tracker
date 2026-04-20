package com.finance.userprofile.domain

import com.finance.shared.error.BusinessRuleViolationException
import java.time.LocalDate
import java.util.UUID

data class UserProfile(
    val id: UUID,
    val firstName: String,
    val lastName: String,
    val displayName: String,
    val preferredCurrency: String,
    val birthDate: LocalDate?
) {
    init {
        if (firstName.isBlank()) throw BusinessRuleViolationException("First name must not be blank")
        if (lastName.isBlank()) throw BusinessRuleViolationException("Last name must not be blank")
        if (displayName.isBlank()) throw BusinessRuleViolationException("Display name must not be blank")
        if (preferredCurrency.length != 3) throw BusinessRuleViolationException("Preferred currency must be a 3-letter ISO 4217 code")
    }
}