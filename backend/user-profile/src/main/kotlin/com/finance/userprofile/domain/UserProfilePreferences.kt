package com.finance.userprofile.domain

import com.finance.shared.error.InvalidRequestException

object UserProfilePreferences {
    val ALLOWED_TABLE_PAGE_SIZES = setOf(10, 20, 50, 100)
    const val DEFAULT_TABLE_PAGE_SIZE = 20

    const val MIN_SESSION_TIMEOUT_MINUTES = 5
    const val MAX_SESSION_TIMEOUT_MINUTES = 15
    const val DEFAULT_SESSION_TIMEOUT_MINUTES = 10

    fun validateTablePageSize(tablePageSize: Int) {
        if (tablePageSize !in ALLOWED_TABLE_PAGE_SIZES) {
            throw InvalidRequestException("tablePageSize must be one of: ${ALLOWED_TABLE_PAGE_SIZES.sorted()}")
        }
    }

    fun validateSessionTimeoutMinutes(sessionTimeoutMinutes: Int) {
        if (sessionTimeoutMinutes !in MIN_SESSION_TIMEOUT_MINUTES..MAX_SESSION_TIMEOUT_MINUTES) {
            throw InvalidRequestException(
                "sessionTimeoutMinutes must be between $MIN_SESSION_TIMEOUT_MINUTES and $MAX_SESSION_TIMEOUT_MINUTES"
            )
        }
    }
}
