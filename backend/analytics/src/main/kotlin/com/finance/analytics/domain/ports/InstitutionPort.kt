package com.finance.analytics.domain.ports

import java.util.UUID

data class InstitutionSummary(
    val id: UUID,
    val name: String,
    val type: String
)

interface InstitutionPort {
    fun findAll(): List<InstitutionSummary>
}
