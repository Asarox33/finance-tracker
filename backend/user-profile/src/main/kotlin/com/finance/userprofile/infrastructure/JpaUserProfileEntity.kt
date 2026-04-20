package com.finance.userprofile.infrastructure

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDate
import java.util.UUID

@Entity
@Table(name = "user_profiles", schema = "user_profile")
class JpaUserProfileEntity(
    @Id
    var id: UUID,

    @Column(name = "first_name", nullable = false)
    var firstName: String,

    @Column(name = "last_name", nullable = false)
    var lastName: String,

    @Column(name = "display_name", nullable = false)
    var displayName: String,

    @Column(name = "preferred_currency", nullable = false, length = 3)
    var preferredCurrency: String,

    @Column(name = "birth_date")
    var birthDate: LocalDate?
)