package com.finance.transaction.infrastructure

import com.finance.shared.Currency
import com.finance.transaction.domain.TransactionStatus
import com.finance.transaction.domain.TransactionType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDate
import java.util.UUID

@Entity
@Table(name = "transactions", schema = "transaction")
class JpaTransactionEntity(
    @Id
    var id: UUID,

    @Column(name = "account_id", nullable = false)
    var accountId: UUID,

    @Column(name = "asset_id")
    var assetId: UUID?,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var type: TransactionType,

    @Column(nullable = false)
    var amount: Long,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 3)
    var currency: Currency,

    @Column(nullable = false)
    var date: LocalDate,

    @Column(nullable = false)
    var label: String,

    @Column(columnDefinition = "TEXT")
    var notes: String?,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var status: TransactionStatus = TransactionStatus.ACTIVE,

    @Column(name = "applied_fx_rate")
    var appliedFxRate: Long?,

    @Column(name = "applied_fx_rate_scale")
    var appliedFxRateScale: Int?,

    @Column(name = "applied_fx_rate_date")
    var appliedFxRateDate: LocalDate?,

    @Enumerated(EnumType.STRING)
    @Column(name = "applied_fx_source_currency", length = 3)
    var appliedFxSourceCurrency: Currency?,

    @Enumerated(EnumType.STRING)
    @Column(name = "applied_fx_target_currency", length = 3)
    var appliedFxTargetCurrency: Currency?,

    @Column(name = "asset_quantity_minor")
    var assetQuantityMinor: Long?,

    @Column(name = "asset_quantity_scale")
    var assetQuantityScale: Int?
)