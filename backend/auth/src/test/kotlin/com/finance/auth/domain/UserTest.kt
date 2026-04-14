package com.finance.auth.domain

import com.finance.shared.error.BusinessRuleViolationException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.util.UUID

class UserTest {

    @Test
    fun constructsValidUser() {
        val user = User(
            id = UUID.randomUUID(),
            email = "user@example.com",
            passwordHash = "hashed",
            active = true
        )
        assertEquals("user@example.com", user.email)
    }

    @Test
    fun rejectsBlankEmail() {
        assertThrows(BusinessRuleViolationException::class.java) {
            User(id = UUID.randomUUID(), email = " ", passwordHash = "hashed", active = true)
        }
    }

    @Test
    fun rejectsBlankPasswordHash() {
        assertThrows(BusinessRuleViolationException::class.java) {
            User(id = UUID.randomUUID(), email = "user@example.com", passwordHash = "", active = true)
        }
    }
}