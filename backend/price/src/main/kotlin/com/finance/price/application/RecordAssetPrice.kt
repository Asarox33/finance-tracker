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

    data class Result(val priceId: UUID, val created: Boolean)

    fun execute(command: Command): Result {
        if (command.price <= 0) throw InvalidRequestException("Asset price must be positive")
        val existing = assetPriceRepository.findByAssetIdAndDate(command.assetId, command.date)
        val assetPrice =
            if (existing != null) {
                AssetPrice(
                    id = existing.id,
                    assetId = command.assetId,
                    price = command.price,
                    currency = command.currency,
                    date = command.date,
                    appliedPriceDate = command.date
                )
            } else {
                AssetPrice(
                    id = UUID.randomUUID(),
                    assetId = command.assetId,
                    price = command.price,
                    currency = command.currency,
                    date = command.date
                )
            }
        val saved = assetPriceRepository.save(assetPrice)
        return Result(priceId = saved.id, created = existing == null)
    }
}