package com.finance.fees.infrastructure

import com.finance.fees.domain.FeeType
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
@Table(name = "fees", schema = "fees")
class JpaFeeEntity(
    @Id
    var id: UUID,

    @Column(name = "account_id")
    var accountId: UUID?,

    @Column(name = "transaction_id")
    var transactionId: UUID?,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var type: FeeType,

    @Column(nullable = false)
    var amount: Long,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 3)
    var currency: Currency,

    @Column(nullable = false)
    var date: LocalDate,

    @Column(nullable = false)
    var label: String
)