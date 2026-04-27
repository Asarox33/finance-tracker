package com.finance.fees

import com.finance.fees.infrastructure.FeeRepositoryAdapter
import com.finance.fees.infrastructure.JpaFeeSpringRepository
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.persistence.autoconfigure.EntityScan
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.jpa.repository.config.EnableJpaRepositories

@Configuration
@EnableAutoConfiguration
@EnableJpaRepositories(basePackages = ["com.finance.fees.infrastructure"])
@EntityScan(basePackages = ["com.finance.fees.infrastructure"])
class FeeTestApplication {

    @Bean
    fun feeRepositoryAdapter(
        jpaRepo: JpaFeeSpringRepository
    ): FeeRepositoryAdapter = FeeRepositoryAdapter(jpaRepo)
}