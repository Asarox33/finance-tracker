package com.finance.price.infrastructure

import com.finance.shared.Currency
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDate
import java.util.UUID

@Entity
@Table(name = "asset_prices", schema = "price")
class JpaAssetPriceEntity(
    @Id
    var id: UUID,

    @Column(name = "asset_id", nullable = false)
    var assetId: UUID,

    @Column(nullable = false)
    var price: Long,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 3)
    var currency: Currency,

    @Column(nullable = false)
    var date: LocalDate,

    @Column(name = "applied_price_date", nullable = false)
    var appliedPriceDate: LocalDate
)