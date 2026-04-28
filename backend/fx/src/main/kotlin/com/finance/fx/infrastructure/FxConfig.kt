package com.finance.fx.infrastructure

import com.finance.fx.application.ConvertAmount
import com.finance.fx.application.GetFxRate
import com.finance.fx.application.RecordFxRate
import com.finance.fx.domain.FxRateRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class FxConfig {

    @Bean
    fun recordFxRate(fxRateRepository: FxRateRepository): RecordFxRate =
        RecordFxRate(fxRateRepository)

    @Bean
    fun getFxRate(
        fxRateRepository: FxRateRepository,
        @Value($$"${fx.lookback-days:30}") lookbackDays: Int
    ): GetFxRate = GetFxRate(fxRateRepository, lookbackDays)

    @Bean
    fun convertAmount(
        fxRateRepository: FxRateRepository,
        @Value($$"${fx.lookback-days:30}") lookbackDays: Int
    ): ConvertAmount = ConvertAmount(fxRateRepository, lookbackDays)
}