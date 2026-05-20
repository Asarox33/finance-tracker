package com.finance.price.application

import com.finance.price.InMemoryAssetPriceRepository
import com.finance.shared.Currency
import com.finance.shared.error.InvalidRequestException
import org.junit.jupiter.api.Assertions.assertEquals
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
    fun replacesPriceForSameAssetAndDate() {
        val assetId = UUID.randomUUID()
        val date = LocalDate.of(2024, 1, 15)
        val first = useCase.execute(
            RecordAssetPrice.Command(assetId, 100L, Currency.EUR, date)
        )
        val second = useCase.execute(
            RecordAssetPrice.Command(assetId, 200L, Currency.EUR, date)
        )
        assertEquals(true, first.created)
        assertEquals(false, second.created)
        assertEquals(first.priceId, second.priceId)
        assertEquals(200L, repository.findByAssetIdAndDate(assetId, date)?.price)
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