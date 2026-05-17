package com.finance.institution.application

import com.finance.institution.domain.Institution
import com.finance.institution.domain.InstitutionRepository
import com.finance.institution.domain.InstitutionType
import com.finance.shared.Country
import com.finance.shared.PageResult

class ListInstitutions(
    private val institutionRepository: InstitutionRepository
) {
    data class Query(
        val page: Int = 0,
        val pageSize: Int = 20,
        val name: String? = null,
        val country: Country? = null,
        val type: InstitutionType? = null
    )

    fun execute(query: Query): PageResult<Institution> {
        val name = query.name?.trim()?.takeIf { it.isNotBlank() }
        val items = institutionRepository.findAll(query.page, query.pageSize, name, query.country, query.type)
        val total = institutionRepository.count(name, query.country, query.type)
        return PageResult.of(items, query.page, query.pageSize, total)
    }
}