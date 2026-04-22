package com.finance.auth

import com.finance.auth.infrastructure.JpaUserRepository
import com.finance.auth.infrastructure.UserRepositoryAdapter
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.persistence.autoconfigure.EntityScan
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration
import org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.jpa.repository.config.EnableJpaRepositories

@Configuration
@EnableAutoConfiguration(
    exclude = [
        SecurityAutoConfiguration::class,
        UserDetailsServiceAutoConfiguration::class
    ]
)
@EnableJpaRepositories(basePackages = ["com.finance.auth.infrastructure"])
@EntityScan(basePackages = ["com.finance.auth.infrastructure"])
class AuthTestApplication {

    @Bean
    fun userRepositoryAdapter(jpaUserRepository: JpaUserRepository): UserRepositoryAdapter =
        UserRepositoryAdapter(jpaUserRepository)
}