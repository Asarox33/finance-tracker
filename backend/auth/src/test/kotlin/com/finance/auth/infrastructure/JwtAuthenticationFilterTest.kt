package com.finance.auth.infrastructure

import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import jakarta.servlet.FilterChain
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.security.core.context.SecurityContextHolder
import java.util.Date
import java.util.UUID

class JwtAuthenticationFilterTest {

    private val secret = "test-secret-key-must-be-long-enough-for-hmac-sha"
    private val filter = JwtAuthenticationFilter(secret)
    private val key = Keys.hmacShaKeyFor(secret.toByteArray())

    @BeforeEach
    fun setup() {
        SecurityContextHolder.clearContext()
    }

    @Test
    fun skipsJwtValidationForRefreshPathWithInvalidBearer() {
        val request = MockHttpServletRequest().apply {
            requestURI = "/api/auth/refresh"
            method = "POST"
            addHeader("Authorization", "Bearer invalid.token.here")
        }
        val response = MockHttpServletResponse()
        var chainCalled = false
        val chain = FilterChain { _, _ -> chainCalled = true }

        filter.doFilter(request, response, chain)

        assertTrue(chainCalled)
        assertEquals(200, response.status)
    }

    @Test
    fun setsAuthenticationForValidToken() {
        val userId = UUID.randomUUID().toString()
        val token = buildToken(userId)
        val request = MockHttpServletRequest().apply {
            addHeader("Authorization", "Bearer $token")
        }
        val response = MockHttpServletResponse()
        val chain = FilterChain { _, _ -> }

        filter.doFilter(request, response, chain)

        val auth = SecurityContextHolder.getContext().authentication
        assertNotNull(auth)
        assertEquals(userId, auth!!.principal)
    }

    @Test
    fun passesRequestThroughWhenNoAuthorizationHeader() {
        val request = MockHttpServletRequest()
        val response = MockHttpServletResponse()
        var chainCalled = false
        val chain = FilterChain { _, _ -> chainCalled = true }

        filter.doFilter(request, response, chain)

        assertTrue(chainCalled)
        assertNull(SecurityContextHolder.getContext().authentication)
    }

    @Test
    fun returns401ForInvalidToken() {
        val request = MockHttpServletRequest().apply {
            addHeader("Authorization", "Bearer invalid.token.here")
        }
        val response = MockHttpServletResponse()
        val chain = FilterChain { _, _ -> }

        filter.doFilter(request, response, chain)

        assertEquals(401, response.status)
    }

    @Test
    fun returns401ForExpiredToken() {
        val token = Jwts.builder()
            .subject(UUID.randomUUID().toString())
            .issuedAt(Date(System.currentTimeMillis() - 10000))
            .expiration(Date(System.currentTimeMillis() - 5000))
            .signWith(key)
            .compact()
        val request = MockHttpServletRequest().apply {
            addHeader("Authorization", "Bearer $token")
        }
        val response = MockHttpServletResponse()
        val chain = FilterChain { _, _ -> }

        filter.doFilter(request, response, chain)

        assertEquals(401, response.status)
    }

    private fun buildToken(userId: String): String = Jwts.builder()
        .subject(userId)
        .issuedAt(Date())
        .expiration(Date(System.currentTimeMillis() + 86400000))
        .signWith(key)
        .compact()
}