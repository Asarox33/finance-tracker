package com.finance.auth.application

data class IssuedAuthSession(
    val accessToken: String,
    val refreshTokenPlain: String
)
