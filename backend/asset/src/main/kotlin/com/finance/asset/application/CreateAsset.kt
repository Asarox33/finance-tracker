package com.finance.asset.application

import com.finance.asset.domain.Asset
import com.finance.asset.domain.AssetRepository
import com.finance.asset.domain.AssetType
import com.finance.shared.Currency
import com.finance.shared.error.InvalidRequestException
import java.util.UUID

class CreateAsset(
    private val assetRepository: AssetRepository
) {
    data class Command(
        val name: String,
        val type: AssetType,
        val currency: Currency,
        val isin: String?,
        val ticker: String?,
        val createdByUserId: UUID
    )

    data class Result(val assetId: UUID)

    fun execute(command: Command): Result {
        if (command.name.isBlank()) throw InvalidRequestException("Asset name must not be blank")
        if (command.isin != null && command.isin.length != 12) throw InvalidRequestException("ISIN must be exactly 12 characters")
        if (command.isin != null && assetRepository.existsByIsin(command.isin)) {
            throw InvalidRequestException("Asset with ISIN already exists: ${command.isin}")
        }
        val asset = Asset(
            id = UUID.randomUUID(),
            name = command.name,
            type = command.type,
            currency = command.currency,
            isin = command.isin?.uppercase(),
            ticker = command.ticker?.uppercase(),
            createdByUserId = command.createdByUserId
        )
        return Result(assetId = assetRepository.save(asset).id)
    }
}