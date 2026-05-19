package com.finance.userprofile.domain

import com.finance.shared.error.InvalidRequestException
import org.junit.jupiter.api.Assertions.assertDoesNotThrow
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test

class UserProfilePreferencesTest {

    @Test
    fun acceptsAllowedTablePageSizes() {
        UserProfilePreferences.ALLOWED_TABLE_PAGE_SIZES.forEach { size ->
            assertDoesNotThrow { UserProfilePreferences.validateTablePageSize(size) }
        }
    }

    @Test
    fun rejectsInvalidTablePageSize() {
        assertThrows(InvalidRequestException::class.java) {
            UserProfilePreferences.validateTablePageSize(25)
        }
    }

    @Test
    fun acceptsSessionTimeoutWithinRange() {
        assertDoesNotThrow { UserProfilePreferences.validateSessionTimeoutMinutes(5) }
        assertDoesNotThrow { UserProfilePreferences.validateSessionTimeoutMinutes(15) }
        assertDoesNotThrow { UserProfilePreferences.validateSessionTimeoutMinutes(10) }
    }

    @Test
    fun rejectsSessionTimeoutBelowMinimum() {
        assertThrows(InvalidRequestException::class.java) {
            UserProfilePreferences.validateSessionTimeoutMinutes(4)
        }
    }

    @Test
    fun rejectsSessionTimeoutAboveMaximum() {
        assertThrows(InvalidRequestException::class.java) {
            UserProfilePreferences.validateSessionTimeoutMinutes(16)
        }
    }
}
