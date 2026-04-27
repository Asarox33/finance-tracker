package com.finance.price.infrastructure

import com.finance.price.application.GetAssetPrice
import com.finance.price.application.ListAssetPrices
import com.finance.price.application.RecordAssetPrice
import com.finance.price.domain.AssetPriceRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class AssetPriceConfig {

    @Bean
    fun recordAssetPrice(assetPriceRepository: AssetPriceRepository): RecordAssetPrice =
        RecordAssetPrice(assetPriceRepository)

    @Bean
    fun getAssetPrice(
        assetPriceRepository: AssetPriceRepository,
        @Value($$"${price.lookback-days:30}") lookbackDays: Int
    ): GetAssetPrice = GetAssetPrice(assetPriceRepository, lookbackDays)

    @Bean
    fun listAssetPrices(assetPriceRepository: AssetPriceRepository): ListAssetPrices =
        ListAssetPrices(assetPriceRepository)
}