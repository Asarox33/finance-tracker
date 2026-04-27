package com.finance.price.application

import com.finance.price.InMemoryAssetPriceRepository
import com.finance.shared.Currency
import com.finance.shared.error.InvalidRequestException
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.util.UUID

class RecordAssetPriceTest {

    private val repository = InMemoryAssetPriceRepository()
    private val useCase = RecordAssetPrice(repository)

    @Test
    fun recordsPriceSuccessfully() {
        val result = useCase.execute(command())
        assertNotNull(result.priceId)
    }

    @Test
    fun rejectsZeroPrice() {
        assertThrows(InvalidRequestException::class.java) { useCase.execute(command(price = 0L)) }
    }

    @Test
    fun rejectsNegativePrice() {
        assertThrows(InvalidRequestException::class.java) { useCase.execute(command(price = -1L)) }
    }

    private fun command(price: Long = 15000L) = RecordAssetPrice.Command(
        assetId = UUID.randomUUID(),
        price = price,
        currency = Currency.USD,
        date = LocalDate.of(2024, 1, 15)
    )
}