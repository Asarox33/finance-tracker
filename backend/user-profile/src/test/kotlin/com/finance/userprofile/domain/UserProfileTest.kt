package com.finance.userprofile.domain

import com.finance.shared.error.BusinessRuleViolationException
import com.finance.userprofile.testProfile
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test

class UserProfileTest {

    @Test
    fun constructsValidProfile() {
        val profile = testProfile()
        assertEquals("John", profile.firstName)
        assertEquals("Doe", profile.lastName)
    }

    @Test
    fun rejectsBlankFirstName() {
        assertThrows(BusinessRuleViolationException::class.java) { testProfile(firstName = " ") }
    }

    @Test
    fun rejectsBlankLastName() {
        assertThrows(BusinessRuleViolationException::class.java) { testProfile(lastName = " ") }
    }

    @Test
    fun rejectsBlankDisplayName() {
        assertThrows(BusinessRuleViolationException::class.java) { testProfile(displayName = " ") }
    }

    @Test
    fun rejectsInvalidCurrencyCode() {
        assertThrows(BusinessRuleViolationException::class.java) { testProfile(preferredCurrency = "EU") }
    }

    @Test
    fun hasNoEmailField() {
        val fields = UserProfile::class.java.declaredFields.map { it.name }
        assert("email" !in fields)
    }
}