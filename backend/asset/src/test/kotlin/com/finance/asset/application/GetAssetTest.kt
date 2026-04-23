package com.finance.asset.application

import com.finance.asset.InMemoryAssetRepository
import com.finance.asset.testAsset
import com.finance.shared.error.NotFoundException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.util.UUID

class GetAssetTest {

    private val repository = InMemoryAssetRepository()
    private val useCase = GetAsset(repository)

    @Test
    fun returnsExistingAsset() {
        val id = UUID.randomUUID()
        repository.save(testAsset(id = id))
        assertEquals(id, useCase.execute(id).id)
    }

    @Test
    fun throwsNotFoundForUnknownAsset() {
        assertThrows(NotFoundException::class.java) { useCase.execute(UUID.randomUUID()) }
    }
}