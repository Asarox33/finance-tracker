package com.finance.asset.application

import com.finance.asset.InMemoryAssetRepository
import com.finance.asset.testAsset
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.util.UUID

class ListAssetsTest {

    private val repository = InMemoryAssetRepository()
    private val useCase = ListAssets(repository)

    @Test
    fun returnsEmptyPageWhenNoAssets() {
        val result = useCase.execute(ListAssets.Query())
        assertEquals(0L, result.totalItems)
        assertTrue(result.isEmpty)
    }

    @Test
    fun returnsPagedAssets() {
        repeat(5) { repository.save(testAsset(id = UUID.randomUUID(), name = "Asset $it", isin = null)) }
        val result = useCase.execute(ListAssets.Query(page = 0, pageSize = 3))
        assertEquals(5L, result.totalItems)
        assertEquals(3, result.items.size)
    }

    @Test
    fun returnsSecondPage() {
        repeat(5) { repository.save(testAsset(id = UUID.randomUUID(), name = "Asset $it", isin = null)) }
        val result = useCase.execute(ListAssets.Query(page = 1, pageSize = 3))
        assertEquals(2, result.items.size)
    }

    @Test
    fun returnsCorrectTotalPages() {
        repeat(5) { repository.save(testAsset(id = UUID.randomUUID(), name = "Asset $it", isin = null)) }
        val result = useCase.execute(ListAssets.Query(page = 0, pageSize = 3))
        assertEquals(2, result.totalPages)
    }
}