package com.finance.asset.application

import com.finance.asset.InMemoryAssetRepository
import com.finance.asset.domain.AssetType
import com.finance.shared.Currency
import com.finance.shared.error.InvalidRequestException
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.util.UUID

class CreateAssetTest {

    private val repository = InMemoryAssetRepository()
    private val useCase = CreateAsset(repository)
    private val userId = UUID.randomUUID()

    @Test
    fun createsAssetSuccessfully() {
        val result = useCase.execute(command())
        assertNotNull(result.assetId)
    }

    @Test
    fun rejectsDuplicateIsin() {
        useCase.execute(command())
        assertThrows(InvalidRequestException::class.java) { useCase.execute(command()) }
    }

    @Test
    fun rejectsBlankName() {
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(command(name = " "))
        }
    }

    @Test
    fun rejectsInvalidIsinLength() {
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(command(isin = "US037833"))
        }
    }

    @Test
    fun createsAssetWithoutIsin() {
        val result = useCase.execute(command(isin = null))
        assertNotNull(result.assetId)
    }

    private fun command(
        name: String = "Apple Inc.",
        isin: String? = "US0378331005"
    ) = CreateAsset.Command(
        name = name,
        type = AssetType.STOCK,
        currency = Currency.USD,
        isin = isin,
        ticker = "AAPL",
        createdByUserId = userId
    )
}