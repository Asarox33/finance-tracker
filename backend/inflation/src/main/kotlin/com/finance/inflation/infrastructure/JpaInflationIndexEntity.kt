package com.finance.inflation.infrastructure

import com.finance.shared.Currency
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.util.UUID

@Entity
@Table(name = "inflation_indices", schema = "inflation")
class JpaInflationIndexEntity(
    @Id
    var id: UUID,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 3)
    var currency: Currency,

    @Column(name = "year_month", nullable = false)
    var yearMonth: String,

    @Column(name = "index_value", nullable = false)
    var indexValue: Long,

    @Column(name = "index_scale", nullable = false)
    var indexScale: Int
)