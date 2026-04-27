package com.finance.price

import com.finance.price.infrastructure.AssetPriceRepositoryAdapter
import com.finance.price.infrastructure.JpaAssetPriceSpringRepository
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.persistence.autoconfigure.EntityScan
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.jpa.repository.config.EnableJpaRepositories

@Configuration
@EnableAutoConfiguration
@EnableJpaRepositories(basePackages = ["com.finance.price.infrastructure"])
@EntityScan(basePackages = ["com.finance.price.infrastructure"])
class PriceTestApplication {

    @Bean
    fun assetPriceRepositoryAdapter(
        jpaRepo: JpaAssetPriceSpringRepository
    ): AssetPriceRepositoryAdapter = AssetPriceRepositoryAdapter(jpaRepo)
}