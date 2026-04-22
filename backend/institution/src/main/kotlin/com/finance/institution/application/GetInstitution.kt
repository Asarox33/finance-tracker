package com.finance.institution.application

import com.finance.institution.domain.Institution
import com.finance.institution.domain.InstitutionRepository
import com.finance.shared.error.NotFoundException
import java.util.UUID

class GetInstitution(
    private val institutionRepository: InstitutionRepository
) {
    fun execute(institutionId: UUID): Institution =
        institutionRepository.findById(institutionId)
            ?: throw NotFoundException("Institution not found: $institutionId")
}