package com.finance.auth.infrastructure

import com.finance.auth.application.PasswordEncoder
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Component

@Component
class SpringPasswordEncoder : PasswordEncoder {
    private val delegate = BCryptPasswordEncoder()

    override fun encode(raw: String): String = delegate.encode(raw)!!
    override fun matches(raw: String, encoded: String): Boolean = delegate.matches(raw, encoded)
}