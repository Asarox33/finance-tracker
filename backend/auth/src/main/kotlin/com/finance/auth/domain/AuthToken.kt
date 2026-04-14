package com.finance.auth.domain

data class AuthToken(
    val value: String,
    val userId: java.util.UUID
)