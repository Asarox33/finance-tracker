package com.finance.auth.infrastructure

import com.finance.auth.application.AuthenticateUser
import com.finance.auth.application.PasswordEncoder
import com.finance.auth.application.RegisterUser
import com.finance.auth.application.TokenIssuer
import com.finance.auth.domain.UserRepository
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class AuthConfig {

    @Bean
    fun registerUser(userRepository: UserRepository, passwordEncoder: PasswordEncoder): RegisterUser =
        RegisterUser(userRepository, passwordEncoder)

    @Bean
    fun authenticateUser(
        userRepository: UserRepository,
        passwordEncoder: PasswordEncoder,
        tokenIssuer: TokenIssuer
    ): AuthenticateUser = AuthenticateUser(userRepository, passwordEncoder, tokenIssuer)
}