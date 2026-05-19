package com.finance.analytics.infrastructure.adapters

import com.finance.analytics.domain.ports.InstitutionPort
import com.finance.analytics.domain.ports.InstitutionSummary
import com.finance.institution.application.ListInstitutions
import org.springframework.stereotype.Component

@Component
class InstitutionPortAdapter(
    private val listInstitutions: ListInstitutions
) : InstitutionPort {
    override fun findAll(): List<InstitutionSummary> {
        val result = listInstitutions.execute(ListInstitutions.Query(page = 0, pageSize = 1000))
        return result.items.map { InstitutionSummary(it.id, it.name, it.type.name) }
    }
}
