package com.finance.institution

import com.finance.institution.domain.Institution
import com.finance.institution.domain.InstitutionRepository
import com.finance.institution.domain.InstitutionType
import com.finance.shared.Country
import java.util.UUID

class InMemoryInstitutionRepository : InstitutionRepository {
    private val store = mutableMapOf<UUID, Institution>()
    override fun save(institution: Institution): Institution { store[institution.id] = institution; return institution }
    override fun findById(id: UUID): Institution? = store[id]
    override fun findAll(
        page: Int,
        pageSize: Int,
        name: String?,
        country: Country?,
        type: InstitutionType?
    ): List<Institution> =
        filtered(name, country, type).drop(page * pageSize).take(pageSize)

    override fun count(name: String?, country: Country?, type: InstitutionType?): Long =
        filtered(name, country, type).size.toLong()

    private fun filtered(name: String?, country: Country?, type: InstitutionType?): List<Institution> =
        store.values
            .filter { institution ->
                (name == null || institution.name.contains(name, ignoreCase = true)) &&
                    (country == null || institution.country == country) &&
                    (type == null || institution.type == type)
            }
            .sortedBy { it.name }
    override fun existsByNameAndCountry(name: String, country: Country): Boolean =
        store.values.any { it.name == name && it.country == country }
}

fun testInstitution(
    id: UUID = UUID.randomUUID(),
    name: String = "BNP Paribas",
    type: InstitutionType = InstitutionType.BANK,
    country: Country = Country.FR,
    bic: String? = "BNPAFRPP",
    createdByUserId: UUID = UUID.randomUUID()
) = Institution(id, name, type, country, bic, createdByUserId)