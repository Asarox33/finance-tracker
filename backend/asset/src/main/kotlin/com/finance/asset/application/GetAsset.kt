package com.finance.asset.application

import com.finance.asset.domain.Asset
import com.finance.asset.domain.AssetRepository
import com.finance.shared.error.NotFoundException
import java.util.UUID

class GetAsset(
    private val assetRepository: AssetRepository
) {
    fun execute(assetId: UUID): Asset =
        assetRepository.findById(assetId)
            ?: throw NotFoundException("Asset not found: $assetId")
}