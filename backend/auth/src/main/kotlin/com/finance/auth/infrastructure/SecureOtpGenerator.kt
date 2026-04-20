package com.finance.auth.infrastructure

import com.finance.auth.application.OtpGenerator
import org.springframework.stereotype.Component
import java.security.SecureRandom

@Component
class SecureOtpGenerator : OtpGenerator {
    private val random = SecureRandom()

    override fun generate(): String =
        String.format("%06d", random.nextInt(1_000_000))
}