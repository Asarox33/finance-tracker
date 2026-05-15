package com.finance.auth.infrastructure

import com.finance.auth.application.AuthenticateUser
import com.finance.auth.application.CreateUserProfilePort
import com.finance.auth.application.EmailSender
import com.finance.auth.application.OtpGenerator
import com.finance.auth.application.PasswordEncoder
import com.finance.auth.application.RefreshAccessToken
import com.finance.auth.application.RefreshTokenFactory
import com.finance.auth.application.RegisterUser
import com.finance.auth.application.RequestPasswordReset
import com.finance.auth.application.ResetPassword
import com.finance.auth.application.RevokeRefreshToken
import com.finance.auth.application.TokenIssuer
import com.finance.auth.domain.PasswordResetTokenRepository
import com.finance.auth.domain.RefreshTokenRepository
import com.finance.auth.domain.UserRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.time.Duration

@Configuration
class AuthConfig {

    @Bean
    fun registerUser(
        userRepository: UserRepository,
        passwordEncoder: PasswordEncoder,
        createUserProfilePort: CreateUserProfilePort
    ): RegisterUser = RegisterUser(userRepository, passwordEncoder, createUserProfilePort)

    @Bean
    fun authenticateUser(
        userRepository: UserRepository,
        passwordEncoder: PasswordEncoder,
        tokenIssuer: TokenIssuer,
        refreshTokenRepository: RefreshTokenRepository,
        refreshTokenFactory: RefreshTokenFactory,
        @Value("\${auth.refresh.expiration-ms}") refreshExpirationMs: Long
    ): AuthenticateUser = AuthenticateUser(
        userRepository,
        passwordEncoder,
        tokenIssuer,
        refreshTokenRepository,
        refreshTokenFactory,
        Duration.ofMillis(refreshExpirationMs)
    )

    @Bean
    fun refreshAccessToken(
        userRepository: UserRepository,
        refreshTokenRepository: RefreshTokenRepository,
        tokenIssuer: TokenIssuer,
        refreshTokenFactory: RefreshTokenFactory,
        @Value("\${auth.refresh.expiration-ms}") refreshExpirationMs: Long
    ): RefreshAccessToken = RefreshAccessToken(
        userRepository,
        refreshTokenRepository,
        tokenIssuer,
        refreshTokenFactory,
        Duration.ofMillis(refreshExpirationMs)
    )

    @Bean
    fun revokeRefreshToken(
        refreshTokenRepository: RefreshTokenRepository,
        refreshTokenFactory: RefreshTokenFactory
    ): RevokeRefreshToken = RevokeRefreshToken(refreshTokenRepository, refreshTokenFactory)

    @Bean
    fun requestPasswordReset(
        userRepository: UserRepository,
        passwordResetTokenRepository: PasswordResetTokenRepository,
        otpGenerator: OtpGenerator,
        passwordEncoder: PasswordEncoder,
        emailSender: EmailSender
    ): RequestPasswordReset = RequestPasswordReset(
        userRepository, passwordResetTokenRepository, otpGenerator, passwordEncoder, emailSender
    )

    @Bean
    fun resetPasswordHandler(
        userRepository: UserRepository,
        passwordResetTokenRepository: PasswordResetTokenRepository,
        passwordEncoder: PasswordEncoder
    ): ResetPassword = ResetPassword(userRepository, passwordResetTokenRepository, passwordEncoder)
}
