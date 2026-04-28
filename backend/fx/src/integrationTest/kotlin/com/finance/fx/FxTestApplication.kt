package com.finance.fx

import com.finance.fx.infrastructure.FxRateRepositoryAdapter
import com.finance.fx.infrastructure.JpaFxRateSpringRepository
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.persistence.autoconfigure.EntityScan
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.jpa.repository.config.EnableJpaRepositories

@Configuration
@EnableAutoConfiguration
@EnableJpaRepositories(basePackages = ["com.finance.fx.infrastructure"])
@EntityScan(basePackages = ["com.finance.fx.infrastructure"])
class FxTestApplication {

    @Bean
    fun fxRateRepositoryAdapter(
        jpaRepo: JpaFxRateSpringRepository
    ): FxRateRepositoryAdapter = FxRateRepositoryAdapter(jpaRepo)
}