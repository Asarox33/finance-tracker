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
        if (bic != null && bic.length !in listOf(8, 11)) throw BusinessRuleViolationException("BIC must be 8 or 11 characters")
    }
}