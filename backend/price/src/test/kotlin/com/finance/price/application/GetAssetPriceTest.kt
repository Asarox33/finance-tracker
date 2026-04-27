package com.finance.price.application

import com.finance.price.InMemoryAssetPriceRepository
import com.finance.price.testAssetPrice
import com.finance.shared.error.NotFoundException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.util.UUID

class GetAssetPriceTest {

    private val repository = InMemoryAssetPriceRepository()
    private val useCase = GetAssetPrice(repository, lookbackDays = 30)
    private val assetId = UUID.randomUUID()

    @Test
    fun returnsExactPriceForDate() {
        val date = LocalDate.of(2024, 1, 15)
        repository.save(testAssetPrice(assetId = assetId, date = date))
        val result = useCase.execute(GetAssetPrice.Query(assetId, date))
        assertEquals(date, result.date)
    }

    @Test
    fun returnsFallbackPriceWithinLookback() {
        val priceDate = LocalDate.of(2024, 1, 10)
        val queryDate = LocalDate.of(2024, 1, 15)
        repository.save(testAssetPrice(assetId = assetId, date = priceDate))
        val result = useCase.execute(GetAssetPrice.Query(assetId, queryDate))
        assertEquals(priceDate, result.date)
    }

    @Test
    fun throwsNotFoundWhenNoPriceWithinLookback() {
        val queryDate = LocalDate.of(2024, 3, 15)
        repository.save(testAssetPrice(assetId = assetId, date = LocalDate.of(2024, 1, 1)))
        assertThrows(NotFoundException::class.java) {
            useCase.execute(GetAssetPrice.Query(assetId, queryDate))
        }
    }

    @Test
    fun throwsNotFoundWhenNoPriceExists() {
        assertThrows(NotFoundException::class.java) {
            useCase.execute(GetAssetPrice.Query(UUID.randomUUID(), LocalDate.of(2024, 1, 15)))
        }
    }
}