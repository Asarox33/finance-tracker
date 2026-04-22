package com.finance.institution.application

import com.finance.institution.InMemoryInstitutionRepository
import com.finance.institution.domain.InstitutionType
import com.finance.shared.Country
import com.finance.shared.error.InvalidRequestException
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.util.UUID

class CreateInstitutionTest {

    private val repository = InMemoryInstitutionRepository()
    private val useCase = CreateInstitution(repository)
    private val userId = UUID.randomUUID()

    @Test
    fun createsInstitutionSuccessfully() {
        val result = useCase.execute(command())
        assertNotNull(result.institutionId)
    }

    @Test
    fun rejectsDuplicateNameAndCountry() {
        useCase.execute(command())
        assertThrows(InvalidRequestException::class.java) { useCase.execute(command()) }
    }

    @Test
    fun rejectsBlankName() {
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(command(name = " "))
        }
    }

    private fun command(name: String = "BNP Paribas") = CreateInstitution.Command(
        name = name,
        type = InstitutionType.BANK,
        country = Country.FR,
        bic = "BNPAFRPP",
        createdByUserId = userId
    )
}