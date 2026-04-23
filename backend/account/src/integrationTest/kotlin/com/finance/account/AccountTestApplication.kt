package com.finance.account

import com.finance.account.infrastructure.AccountRepositoryAdapter
import com.finance.account.infrastructure.JpaAccountSpringRepository
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.persistence.autoconfigure.EntityScan
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.jpa.repository.config.EnableJpaRepositories

@Configuration
@EnableAutoConfiguration
@EnableJpaRepositories(basePackages = ["com.finance.account.infrastructure"])
@EntityScan(basePackages = ["com.finance.account.infrastructure"])
class AccountTestApplication {

    @Bean
    fun accountRepositoryAdapter(
        jpaRepo: JpaAccountSpringRepository
    ): AccountRepositoryAdapter = AccountRepositoryAdapter(jpaRepo)
}