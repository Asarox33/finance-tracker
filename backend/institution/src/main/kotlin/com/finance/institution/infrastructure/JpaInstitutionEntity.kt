package com.finance.institution.infrastructure

import com.finance.institution.domain.InstitutionType
import com.finance.shared.Country
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.util.UUID

@Entity
@Table(name = "institutions", schema = "institution")
class JpaInstitutionEntity(
    @Id
    var id: UUID,

    @Column(nullable = false)
    var name: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var type: InstitutionType,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 2)
    var country: Country,

    @Column(length = 11)
    var bic: String?,

    @Column(name = "created_by_user_id", nullable = false, updatable = false)
    var createdByUserId: UUID
)