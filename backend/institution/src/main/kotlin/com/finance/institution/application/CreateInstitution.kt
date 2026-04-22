package com.finance.institution.application

import com.finance.institution.domain.Institution
import com.finance.institution.domain.InstitutionRepository
import com.finance.institution.domain.InstitutionType
import com.finance.shared.Country
import com.finance.shared.error.InvalidRequestException
import java.util.UUID

class CreateInstitution(
    private val institutionRepository: InstitutionRepository
) {
    data class Command(
        val name: String,
        val type: InstitutionType,
        val country: Country,
        val bic: String?,
        val createdByUserId: UUID
    )

    data class Result(val institutionId: UUID)

    fun execute(command: Command): Result {
        if (command.name.isBlank()) throw InvalidRequestException("Institution name must not be blank")
        if (institutionRepository.existsByNameAndCountry(command.name, command.country)) {
            throw InvalidRequestException("Institution already exists: ${command.name} in ${command.country}")
        }
        val institution = Institution(
            id = UUID.randomUUID(),
            name = command.name,
            type = command.type,
            country = command.country,
            bic = command.bic?.uppercase(),
            createdByUserId = command.createdByUserId
        )
        return Result(institutionId = institutionRepository.save(institution).id)
    }
}