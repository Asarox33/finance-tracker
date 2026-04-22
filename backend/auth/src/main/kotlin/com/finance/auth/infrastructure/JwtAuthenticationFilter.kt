package com.finance.auth.infrastructure

import io.jsonwebtoken.JwtException
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthenticationFilter(
    @param:Value($$"${auth.jwt.secret}") private val secret: String
) : OncePerRequestFilter() {

    private val key by lazy { Keys.hmacShaKeyFor(secret.toByteArray()) }

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val header = request.getHeader("Authorization")

        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response)
            return
        }

        val token = header.removePrefix("Bearer ").trim()

        try {
            val claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .payload

            val auth = UsernamePasswordAuthenticationToken(
                claims.subject,
                null,
                listOf(SimpleGrantedAuthority("ROLE_USER"))
            )
            SecurityContextHolder.getContext().authentication = auth
        } catch (_: JwtException) {
            SecurityContextHolder.clearContext()
            response.status = HttpServletResponse.SC_UNAUTHORIZED
            response.contentType = "application/json"
            response.writer.write("""{"message":"Invalid or expired token"}""")
            return
        }

        filterChain.doFilter(request, response)
    }
}