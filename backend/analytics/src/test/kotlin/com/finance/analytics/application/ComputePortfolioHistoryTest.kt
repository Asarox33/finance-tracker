package com.finance.analytics.application

import com.finance.analytics.StubAccountPort
import com.finance.analytics.StubAssetLabelPort
import com.finance.analytics.StubAssetMarkPricePort
import com.finance.analytics.StubFxRatePort
import com.finance.analytics.StubInstitutionPort
import com.finance.analytics.StubTransactionPort
import com.finance.shared.Currency
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.util.UUID

class ComputePortfolioHistoryTest {

    @Test
    fun returnsOldestFirstWithOnePointPerDay() {
        val portfolioValue = ComputePortfolioValue(
            StubAccountPort(),
            StubInstitutionPort(),
            StubTransactionPort(),
            StubFxRatePort(),
            StubAssetMarkPricePort(),
            StubAssetLabelPort()
        )
        val useCase = ComputePortfolioHistory(portfolioValue)
        val result = useCase.execute(
            ComputePortfolioHistory.Query(UUID.randomUUID(), 30, Currency.EUR)
        )
        assertEquals(30, result.points.size)
        assertTrue(result.points.first().date.isBefore(result.points.last().date))
        assertEquals(Currency.EUR, result.referenceCurrency)
    }
}
