package com.finance.auth.domain

import com.finance.shared.error.BusinessRuleViolationException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.time.Instant
import java.util.UUID

class UserTest {

    @Test
    fun constructsValidUser() {
        val user = user()
        assertEquals("user@example.com", user.email)
    }

    @Test
    fun rejectsBlankEmail() {
        assertThrows(BusinessRuleViolationException::class.java) { user(email = " ") }
    }

    @Test
    fun rejectsBlankPasswordHash() {
        assertThrows(BusinessRuleViolationException::class.java) { user(passwordHash = "") }
    }

    @Test
    fun recordsFailedLoginAndIncrementsCounter() {
        val now = Instant.now()
        val updated = user().recordFailedLogin(now)
        assertEquals(1, updated.failedLoginAttempts)
        assertEquals(now, updated.lastFailedLoginAt)
        assertTrue(updated.active)
    }

    @Test
    fun locksAccountAfterThreeFailedAttempts() {
        val now = Instant.now()
        val locked = user()
            .recordFailedLogin(now)
            .recordFailedLogin(now)
            .recordFailedLogin(now)
        assertFalse(locked.active)
        assertEquals(3, locked.failedLoginAttempts)
    }

    @Test
    fun canAttemptLoginWhenActive() {
        assertTrue(user().canAttemptLogin(Instant.now()))
    }

    @Test
    fun cannotAttemptLoginWhenLockedAndCooldownNotPassed() {
        val now = Instant.now()
        val locked = user().recordFailedLogin(now).recordFailedLogin(now).recordFailedLogin(now)
        assertFalse(locked.canAttemptLogin(now.plusSeconds(60)))
    }

    @Test
    fun canAttemptLoginAfterCooldownPassed() {
        val now = Instant.now()
        val locked = user().recordFailedLogin(now).recordFailedLogin(now).recordFailedLogin(now)
        assertTrue(locked.canAttemptLogin(now.plusSeconds(901)))
    }

    @Test
    fun recordsSuccessfulLoginResetsCounterAndTimestamp() {
        val now = Instant.now()
        val reset = user().recordFailedLogin(now).recordSuccessfulLogin()
        assertEquals(0, reset.failedLoginAttempts)
        assertNull(reset.lastFailedLoginAt)
    }

    private fun user(
        email: String = "user@example.com",
        passwordHash: String = "hashed"
    ) = User(UUID.randomUUID(), email, passwordHash, true)
}