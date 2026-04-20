package com.finance.auth.infrastructure

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "password_reset_tokens", schema = "auth")
class JpaPasswordResetTokenEntity(
    @Id
    var id: UUID,

    @Column(name = "user_id", nullable = false)
    var userId: UUID,

    @Column(name = "otp_hash", nullable = false)
    var otpHash: String,

    @Column(name = "expires_at", nullable = false)
    var expiresAt: Instant,

    @Column(nullable = false)
    var used: Boolean = false
)