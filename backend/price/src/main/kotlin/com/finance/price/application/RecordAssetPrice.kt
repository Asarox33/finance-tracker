package com.finance.price.application

import com.finance.price.domain.AssetPrice
import com.finance.price.domain.AssetPriceRepository
import com.finance.shared.Currency
import com.finance.shared.error.InvalidRequestException
import java.time.LocalDate
import java.util.UUID

class RecordAssetPrice(
    private val assetPriceRepository: AssetPriceRepository
) {
    data class Command(
        val assetId: UUID,
        val price: Long,
        val currency: Currency,
        val date: LocalDate
    )

    data class Result(val priceId: UUID)

    fun execute(command: Command): Result {
        if (command.price <= 0) throw InvalidRequestException("Asset price must be positive")
        val assetPrice = AssetPrice(
            id = UUID.randomUUID(),
            assetId = command.assetId,
            price = command.price,
            currency = command.currency,
            date = command.date
        )
        return Result(priceId = assetPriceRepository.save(assetPrice).id)
    }
}