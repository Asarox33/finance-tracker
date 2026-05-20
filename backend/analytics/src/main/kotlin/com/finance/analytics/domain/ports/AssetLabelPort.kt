package com.finance.analytics.domain.ports

import java.util.UUID

data class AssetLabel(
    val name: String,
    val ticker: String?
)

interface AssetLabelPort {
    fun labelsFor(assetIds: Set<UUID>): Map<UUID, AssetLabel>
}
