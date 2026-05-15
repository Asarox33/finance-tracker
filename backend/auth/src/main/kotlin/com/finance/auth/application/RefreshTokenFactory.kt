package com.finance.auth.application

data class OpaqueRefreshTokenCreated(
    val plainText: String,
    val tokenHash: String
)

interface RefreshTokenFactory {
    fun create(): OpaqueRefreshTokenCreated
    fun hash(plainText: String): String
}
