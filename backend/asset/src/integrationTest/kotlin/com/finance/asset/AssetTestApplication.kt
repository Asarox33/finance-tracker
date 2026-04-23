package com.finance.asset

import com.finance.asset.infrastructure.AssetRepositoryAdapter
import com.finance.asset.infrastructure.JpaAssetSpringRepository
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.persistence.autoconfigure.EntityScan
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.jpa.repository.config.EnableJpaRepositories

@Configuration
@EnableAutoConfiguration
@EnableJpaRepositories(basePackages = ["com.finance.asset.infrastructure"])
@EntityScan(basePackages = ["com.finance.asset.infrastructure"])
class AssetTestApplication {

    @Bean
    fun assetRepositoryAdapter(
        jpaRepo: JpaAssetSpringRepository
    ): AssetRepositoryAdapter = AssetRepositoryAdapter(jpaRepo)
}