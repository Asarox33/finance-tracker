package com.finance.institution.application

import com.finance.institution.domain.Institution
import com.finance.institution.domain.InstitutionRepository
import com.finance.shared.PageResult

class ListInstitutions(
    private val institutionRepository: InstitutionRepository
) {
    data class Query(val page: Int = 0, val pageSize: Int = 20)

    fun execute(query: Query): PageResult<Institution> {
        val items = institutionRepository.findAll(query.page, query.pageSize)
        val total = institutionRepository.count()
        return PageResult.of(items, query.page, query.pageSize, total)
    }
}