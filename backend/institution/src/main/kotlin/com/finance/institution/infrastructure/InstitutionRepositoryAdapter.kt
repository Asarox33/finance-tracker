package com.finance.institution.infrastructure

import com.finance.institution.domain.Institution
import com.finance.institution.domain.InstitutionRepository
import com.finance.shared.Country
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class InstitutionRepositoryAdapter(
    private val jpaRepo: JpaInstitutionSpringRepository
) : InstitutionRepository {

    override fun save(institution: Institution): Institution {
        val entity = jpaRepo.findById(institution.id).orElse(null)
            ?.also {
                it.name = institution.name
                it.type = institution.type
                it.country = institution.country
                it.bic = institution.bic
            }
            ?: JpaInstitutionEntity(
                id = institution.id,
                name = institution.name,
                type = institution.type,
                country = institution.country,
                bic = institution.bic,
                createdByUserId = institution.createdByUserId
            )
        return jpaRepo.save(entity).toDomain()
    }

    override fun findById(id: UUID): Institution? =
        jpaRepo.findById(id).orElse(null)?.toDomain()

    override fun findAll(page: Int, pageSize: Int): List<Institution> =
        jpaRepo.findAllBy(PageRequest.of(page, pageSize)).content.map { it.toDomain() }

    override fun count(): Long = jpaRepo.count()

    override fun existsByNameAndCountry(name: String, country: Country): Boolean =
        jpaRepo.existsByNameAndCountry(name, country)
}

private fun JpaInstitutionEntity.toDomain() = Institution(
    id = id,
    name = name,
    type = type,
    country = country,
    bic = bic,
    createdByUserId = createdByUserId
)