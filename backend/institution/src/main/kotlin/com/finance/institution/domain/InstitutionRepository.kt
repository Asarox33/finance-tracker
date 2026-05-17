package com.finance.institution.domain

import com.finance.shared.Country
import java.util.UUID

interface InstitutionRepository {
    fun save(institution: Institution): Institution
    fun findById(id: UUID): Institution?
    fun findAll(
        page: Int,
        pageSize: Int,
        name: String? = null,
        country: Country? = null,
        type: InstitutionType? = null
    ): List<Institution>
    fun count(name: String? = null, country: Country? = null, type: InstitutionType? = null): Long
    fun existsByNameAndCountry(name: String, country: Country): Boolean
}