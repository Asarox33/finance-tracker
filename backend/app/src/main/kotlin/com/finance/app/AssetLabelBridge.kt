package com.finance.app

import com.finance.analytics.domain.ports.AssetLabel
import com.finance.analytics.domain.ports.AssetLabelPort
import com.finance.asset.domain.AssetRepository
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class AssetLabelBridge(
    private val assetRepository: AssetRepository
) : AssetLabelPort {
    override fun labelsFor(assetIds: Set<UUID>): Map<UUID, AssetLabel> =
        assetIds.mapNotNull { id ->
            assetRepository.findById(id)?.let { asset ->
                id to AssetLabel(name = asset.name, ticker = asset.ticker)
            }
        }.toMap()
}
