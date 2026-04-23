package com.finance.institution.domain

import com.finance.shared.Country
import com.finance.shared.error.BusinessRuleViolationException
import java.util.UUID

data class Institution(
    val id: UUID,
    val name: String,
    val type: InstitutionType,
    val country: Country,
    val bic: String?,
    val createdByUserId: UUID
) {
    init {
        if (name.isBlank()) throw BusinessRuleViolationException("Institution name must not be blank")
        if (bic != null && !BIC_REGEX.matches(bic)) {
            throw BusinessRuleViolationException("BIC format is invalid: $bic. Expected format: 4 letters + 2 letters + 2 alphanumeric + optional 3 alphanumeric")
        }
    }

    companion object {
        private val BIC_REGEX = Regex("^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$")
    }
}