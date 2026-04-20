package com.finance.shared.validation

import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class PasswordPolicyTest {

    @Test
    fun acceptsValidPassword() {
        assertTrue(PasswordPolicy.isValid("Password1!securepass"))
    }

    @Test
    fun rejectsTooShortPassword() {
        assertFalse(PasswordPolicy.isValid("Pass1!"))
    }

    @Test
    fun rejectsMissingUppercase() {
        assertFalse(PasswordPolicy.isValid("password1!securepass"))
    }

    @Test
    fun rejectsMissingLowercase() {
        assertFalse(PasswordPolicy.isValid("PASSWORD1!SECUREPASS"))
    }

    @Test
    fun rejectsMissingDigit() {
        assertFalse(PasswordPolicy.isValid("Password!securepass"))
    }

    @Test
    fun rejectsMissingSpecialChar() {
        assertFalse(PasswordPolicy.isValid("Password1securepass"))
    }

    @Test
    fun rejectsTooLongPassword() {
        assertFalse(PasswordPolicy.isValid("P1!".padEnd(129, 'a')))
    }
}