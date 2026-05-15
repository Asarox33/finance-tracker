package com.finance.auth.infrastructure

import org.springframework.http.ResponseCookie
import org.springframework.stereotype.Component
import java.time.Duration
import org.springframework.beans.factory.annotation.Value

@Component
class RefreshCookieFactory(
    @param:Value($$"${auth.refresh.expiration-ms}")
    private val refreshExpirationMs: Long,

    @param:Value($$"${auth.refresh-cookie.secure}")
    private val secure: Boolean
) {

    fun buildSetCookie(refreshTokenPlain: String): String =
        ResponseCookie.from(COOKIE_NAME, refreshTokenPlain)
            .httpOnly(true)
            .path(COOKIE_PATH)
            .maxAge(Duration.ofMillis(refreshExpirationMs))
            .secure(secure)
            .sameSite("Lax")
            .build()
            .toString()

    fun buildClearCookie(): String =
        ResponseCookie.from(COOKIE_NAME, "")
            .httpOnly(true)
            .path(COOKIE_PATH)
            .maxAge(Duration.ZERO)
            .secure(secure)
            .sameSite("Lax")
            .build()
            .toString()

    companion object {
        const val COOKIE_NAME: String = "ft_refresh"
        const val COOKIE_PATH: String = "/api"
    }
}
