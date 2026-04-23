package com.finance.account.infrastructure

import com.finance.account.domain.AccountStatus
import com.finance.account.domain.AccountType
import com.finance.shared.Currency
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.util.UUID

@Entity
@Table(name = "accounts", schema = "account")
class JpaAccountEntity(
    @Id
    var id: UUID,

    @Column(name = "user_id", nullable = false)
    var userId: UUID,

    @Column(name = "institution_id", nullable = false)
    var institutionId: UUID,

    @Column(nullable = false)
    var name: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var type: AccountType,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 3)
    var currency: Currency,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    var status: AccountStatus
)