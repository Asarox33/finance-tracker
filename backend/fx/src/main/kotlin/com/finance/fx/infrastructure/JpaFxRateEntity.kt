package com.finance.fx.infrastructure

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
@Table(name = "fx_rates", schema = "fx")
class JpaFxRateEntity(
    @Id
    var id: UUID,

    @Enumerated(EnumType.STRING)
    @Column(name = "source_currency", nullable = false, length = 3)
    var sourceCurrency: Currency,

    @Enumerated(EnumType.STRING)
    @Column(name = "target_currency", nullable = false, length = 3)
    var targetCurrency: Currency,

    @Column(nullable = false)
    var rate: Long,

    @Column(name = "rate_scale", nullable = false)
    var rateScale: Int,

    @Column(nullable = false)
    var date: LocalDate,

    @Column(name = "applied_rate_date", nullable = false)
    var appliedRateDate: LocalDate
)