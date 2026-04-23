package com.finance.institution.domain

import com.finance.shared.Country
import com.finance.shared.error.BusinessRuleViolationException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.util.UUID

class InstitutionTest {

    private val userId = UUID.randomUUID()

    @Test
    fun constructsValidInstitution() {
        val institution = Institution(UUID.randomUUID(), "BNP Paribas", InstitutionType.BANK, Country.FR, "BNPAFRPP", userId)
        assertEquals("BNP Paribas", institution.name)
    }

    @Test
    fun rejectsBlankName() {
        assertThrows(BusinessRuleViolationException::class.java) {
            Institution(UUID.randomUUID(), " ", InstitutionType.BANK, Country.FR, null, userId)
        }
    }

    @Test
    fun rejectsInvalidBicFormat() {
        assertThrows(BusinessRuleViolationException::class.java) {
            Institution(UUID.randomUUID(), "BNP Paribas", InstitutionType.BANK, Country.FR, "BNPA", userId)
        }
    }

    @Test
    fun rejectsLowercaseBic() {
        assertThrows(BusinessRuleViolationException::class.java) {
            Institution(UUID.randomUUID(), "BNP Paribas", InstitutionType.BANK, Country.FR, "bnpafrpp", userId)
        }
    }

    @Test
    fun acceptsValidEightCharBic() {
        val institution = Institution(UUID.randomUUID(), "BNP Paribas", InstitutionType.BANK, Country.FR, "BNPAFRPP", userId)
        assertEquals("BNPAFRPP", institution.bic)
    }

    @Test
    fun acceptsValidElevenCharBic() {
        val institution = Institution(UUID.randomUUID(), "BNP Paribas", InstitutionType.BANK, Country.FR, "BNPAFRPP123", userId)
        assertEquals("BNPAFRPP123", institution.bic)
    }

    @Test
    fun acceptsNullBic() {
        val institution = Institution(UUID.randomUUID(), "BNP Paribas", InstitutionType.BANK, Country.FR, null, userId)
        assertNull(institution.bic)
    }
}