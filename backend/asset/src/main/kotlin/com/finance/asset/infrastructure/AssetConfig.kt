package com.finance.asset.infrastructure

import com.finance.asset.application.CreateAsset
import com.finance.asset.application.GetAsset
import com.finance.asset.application.ListAssets
import com.finance.asset.domain.AssetRepository
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class AssetConfig {

    @Bean
    fun createAsset(assetRepository: AssetRepository): CreateAsset =
        CreateAsset(assetRepository)

    @Bean
    fun getAsset(assetRepository: AssetRepository): GetAsset =
        GetAsset(assetRepository)

    @Bean
    fun listAssets(assetRepository: AssetRepository): ListAssets =
        ListAssets(assetRepository)
}