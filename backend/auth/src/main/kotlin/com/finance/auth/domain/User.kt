package com.finance.auth.domain

import com.finance.shared.error.BusinessRuleViolationException
import java.util.UUID

data class User(
    val id: UUID,
    val email: String,
    val passwordHash: String,
    val active: Boolean
) {
    init {
        if (email.isBlank()) throw BusinessRuleViolationException("Email must not be blank")
        if (passwordHash.isBlank()) throw BusinessRuleViolationException("Password hash must not be blank")
    }
}