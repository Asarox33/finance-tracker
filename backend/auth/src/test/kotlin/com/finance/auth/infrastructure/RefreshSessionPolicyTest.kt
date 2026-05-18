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
        assertEquals(Duration.ofMinutes(10), policy.effectiveRefreshTtl())
    }
}
