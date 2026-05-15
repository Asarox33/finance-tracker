package com.finance.institution.infrastructure

import com.finance.shared.Country
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface JpaInstitutionSpringRepository : JpaRepository<JpaInstitutionEntity, UUID> {
    fun existsByNameAndCountry(name: String, country: Country): Boolean
    fun findAllBy(pageable: Pageable): Page<JpaInstitutionEntity>
    fun findByNameContainingIgnoreCase(name: String, pageable: Pageable): Page<JpaInstitutionEntity>
    fun findByCountry(country: Country, pageable: Pageable): Page<JpaInstitutionEntity>
    fun findByNameContainingIgnoreCaseAndCountry(
        name: String,
        country: Country,
        pageable: Pageable
    ): Page<JpaInstitutionEntity>
    fun countByNameContainingIgnoreCase(name: String): Long
    fun countByCountry(country: Country): Long
    fun countByNameContainingIgnoreCaseAndCountry(name: String, country: Country): Long
}