package com.finance.inflation

import com.finance.inflation.infrastructure.InflationIndexRepositoryAdapter
import com.finance.inflation.infrastructure.JpaInflationIndexSpringRepository
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.persistence.autoconfigure.EntityScan
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.jpa.repository.config.EnableJpaRepositories

@Configuration
@EnableAutoConfiguration
@EnableJpaRepositories(basePackages = ["com.finance.inflation.infrastructure"])
@EntityScan(basePackages = ["com.finance.inflation.infrastructure"])
class InflationTestApplication {

    @Bean
    fun inflationIndexRepositoryAdapter(
        jpaRepo: JpaInflationIndexSpringRepository
    ): InflationIndexRepositoryAdapter = InflationIndexRepositoryAdapter(jpaRepo)
}