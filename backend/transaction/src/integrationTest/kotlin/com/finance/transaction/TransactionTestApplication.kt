package com.finance.transaction

import com.finance.transaction.infrastructure.JpaTransactionSpringRepository
import com.finance.transaction.infrastructure.TransactionRepositoryAdapter
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.persistence.autoconfigure.EntityScan
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.jpa.repository.config.EnableJpaRepositories

@Configuration
@EnableAutoConfiguration
@EnableJpaRepositories(basePackages = ["com.finance.transaction.infrastructure"])
@EntityScan(basePackages = ["com.finance.transaction.infrastructure"])
class TransactionTestApplication {

    @Bean
    fun transactionRepositoryAdapter(
        jpaRepo: JpaTransactionSpringRepository
    ): TransactionRepositoryAdapter = TransactionRepositoryAdapter(jpaRepo)
}