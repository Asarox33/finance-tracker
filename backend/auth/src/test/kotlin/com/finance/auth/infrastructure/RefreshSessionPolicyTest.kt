package com.finance.auth.infrastructure

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import java.time.Duration

class RefreshSessionPolicyTest {

    @Test
    fun keepsConfiguredRefreshTtlAtOrBelowMaximum() {
        val policy = RefreshSessionPolicy(300_000L)

        assertEquals(300_000L, policy.effectiveRefreshExpirationMs)
        assertEquals(Duration.ofMinutes(5), policy.effectiveRefreshTtl())
    }

    @Test
    fun capsConfiguredRefreshTtlAboveMaximum() {
        val policy = RefreshSessionPolicy(604_800_000L)

        assertEquals(RefreshSessionPolicy.MAX_REFRESH_EXPIRATION_MS, policy.effectiveRefreshExpirationMs)
        assertEquals(Duration.ofMinutes(15), policy.effectiveRefreshTtl())
    }

    @Test
    fun effectiveRefreshTtlForUserMinutes() {
        val policy = RefreshSessionPolicy(600_000L)

        assertEquals(Duration.ofMinutes(5), policy.effectiveRefreshTtl(5))
        assertEquals(Duration.ofMinutes(15), policy.effectiveRefreshTtl(15))
        assertEquals(Duration.ofMinutes(15), policy.effectiveRefreshTtl(20))
    }
}
