package com.finance.asset.domain

import com.finance.shared.Currency
import com.finance.shared.error.BusinessRuleViolationException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.util.UUID

class AssetTest {

    @Test
    fun constructsValidAsset() {
        val asset = Asset(UUID.randomUUID(), "Apple Inc.", AssetType.STOCK, Currency.USD, "US0378331005", "AAPL", UUID.randomUUID())
        assertEquals("Apple Inc.", asset.name)
    }

    @Test
    fun rejectsBlankName() {
        assertThrows(BusinessRuleViolationException::class.java) {
            Asset(UUID.randomUUID(), " ", AssetType.STOCK, Currency.USD, null, null, UUID.randomUUID())
        }
    }

    @Test
    fun rejectsInvalidIsinLength() {
        assertThrows(BusinessRuleViolationException::class.java) {
            Asset(UUID.randomUUID(), "Apple Inc.", AssetType.STOCK, Currency.USD, "US037833", null, UUID.randomUUID())
        }
    }

    @Test
    fun rejectsBlankTicker() {
        assertThrows(BusinessRuleViolationException::class.java) {
            Asset(UUID.randomUUID(), "Apple Inc.", AssetType.STOCK, Currency.USD, null, " ", UUID.randomUUID())
        }
    }

    @Test
    fun acceptsNullIsinAndTicker() {
        val asset = Asset(UUID.randomUUID(), "Cash EUR", AssetType.CASH, Currency.EUR, null, null, UUID.randomUUID())
        assertNull(asset.isin)
        assertNull(asset.ticker)
    }
}