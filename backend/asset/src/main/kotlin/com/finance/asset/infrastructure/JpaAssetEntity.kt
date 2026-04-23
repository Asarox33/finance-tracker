package com.finance.asset.infrastructure

import com.finance.asset.domain.AssetType
import com.finance.shared.Currency
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.util.UUID

@Entity
@Table(name = "assets", schema = "asset")
class JpaAssetEntity(
    @Id
    var id: UUID,

    @Column(nullable = false)
    var name: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var type: AssetType,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 3)
    var currency: Currency,

    @Column(length = 12, unique = true)
    var isin: String?,

    @Column(length = 20)
    var ticker: String?,

    @Column(name = "created_by_user_id", nullable = false, updatable = false)
    var createdByUserId: UUID
)