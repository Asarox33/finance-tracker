package com.finance.institution.domain

import com.finance.shared.Country
import com.finance.shared.error.BusinessRuleViolationException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.util.UUID

class InstitutionTest {

    @Test
    fun constructsValidInstitution() {
        val institution = Institution(UUID.randomUUID(), "BNP Paribas", InstitutionType.BANK, Country.FR, "BNPAFRPP")
        assertEquals("BNP Paribas", institution.name)
    }

    @Test
    fun rejectsBlankName() {
        assertThrows(BusinessRuleViolationException::class.java) {
            Institution(UUID.randomUUID(), " ", InstitutionType.BANK, Country.FR, null)
        }
    }

    @Test
    fun rejectsInvalidBicLength() {
        assertThrows(BusinessRuleViolationException::class.java) {
            Institution(UUID.randomUUID(), "BNP Paribas", InstitutionType.BANK, Country.FR, "BNPA")
        }
    }

    @Test
    fun acceptsNullBic() {
        val institution = Institution(UUID.randomUUID(), "BNP Paribas", InstitutionType.BANK, Country.FR, null)
        assertNull(institution.bic)
    }

    @Test
    fun acceptsElevenCharBic() {
        val institution = Institution(UUID.randomUUID(), "BNP Paribas", InstitutionType.BANK, Country.FR, "BNPAFRPP123")
        assertEquals("BNPAFRPP123", institution.bic)
    }
}