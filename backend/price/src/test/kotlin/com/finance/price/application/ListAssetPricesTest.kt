package com.finance.price.application

import com.finance.price.InMemoryAssetPriceRepository
import com.finance.price.testAssetPrice
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.util.UUID

class ListAssetPricesTest {

    private val repository = InMemoryAssetPriceRepository()
    private val useCase = ListAssetPrices(repository)

    @Test
    fun returnsEmptyPageWhenNoPrices() {
        val result = useCase.execute(ListAssetPrices.Query(UUID.randomUUID()))
        assertTrue(result.isEmpty)
    }

    @Test
    fun returnsPricesForAsset() {
        val assetId = UUID.randomUUID()
        repeat(3) { i ->
            repository.save(testAssetPrice(assetId = assetId, date = LocalDate.of(2024, 1, i + 1)))
        }
        val result = useCase.execute(ListAssetPrices.Query(assetId))
        assertEquals(3L, result.totalItems)
    }

    @Test
    fun returnsPagedResults() {
        val assetId = UUID.randomUUID()
        repeat(5) { i ->
            repository.save(testAssetPrice(assetId = assetId, date = LocalDate.of(2024, 1, i + 1)))
        }
        val result = useCase.execute(ListAssetPrices.Query(assetId, page = 0, pageSize = 3))
        assertEquals(3, result.items.size)
        assertEquals(5L, result.totalItems)
    }
}