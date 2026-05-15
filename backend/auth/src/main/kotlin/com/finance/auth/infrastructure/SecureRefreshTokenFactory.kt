package com.finance.auth.infrastructure

import com.finance.auth.application.OpaqueRefreshTokenCreated
import com.finance.auth.application.RefreshTokenFactory
import org.springframework.stereotype.Component
import java.security.MessageDigest
import java.security.SecureRandom
import java.util.Base64

@Component
class SecureRefreshTokenFactory : RefreshTokenFactory {

    private val random = SecureRandom()

    override fun create(): OpaqueRefreshTokenCreated {
        val bytes = ByteArray(32)
        random.nextBytes(bytes)
        val plain = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes)
        return OpaqueRefreshTokenCreated(plainText = plain, tokenHash = hash(plain))
    }

    override fun hash(plainText: String): String {
        val digest = MessageDigest.getInstance("SHA-256").digest(plainText.toByteArray(Charsets.UTF_8))
        return digest.joinToString("") { byte -> "%02x".format(byte) }
    }
}
