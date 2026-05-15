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

    override fun findAll(page: Int, pageSize: Int, name: String?, country: Country?): List<Institution> {
        val pageable = PageRequest.of(page, pageSize)
        val page = when {
            name != null && country != null ->
                jpaRepo.findByNameContainingIgnoreCaseAndCountry(name, country, pageable)
            name != null -> jpaRepo.findByNameContainingIgnoreCase(name, pageable)
            country != null -> jpaRepo.findByCountry(country, pageable)
            else -> jpaRepo.findAllBy(pageable)
        }
        return page.content.map { it.toDomain() }
    }

    override fun count(name: String?, country: Country?): Long = when {
        name != null && country != null -> jpaRepo.countByNameContainingIgnoreCaseAndCountry(name, country)
        name != null -> jpaRepo.countByNameContainingIgnoreCase(name)
        country != null -> jpaRepo.countByCountry(country)
        else -> jpaRepo.count()
    }

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