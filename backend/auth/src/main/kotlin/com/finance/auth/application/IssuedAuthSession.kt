package com.finance.auth.application

import java.time.Duration

data class IssuedAuthSession(
    val accessToken: String,
    val refreshTokenPlain: String,
    val refreshMaxAge: Duration
)
