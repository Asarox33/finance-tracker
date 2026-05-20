package com.finance.inflation.infrastructure

import com.finance.inflation.application.ComputeInflationFactor
import com.finance.inflation.application.GetInflationIndex
import com.finance.inflation.application.ListInflationIndices
import com.finance.inflation.application.RecordInflationIndex
import com.finance.inflation.domain.InflationIndexRepository
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class InflationConfig {

    @Bean
    fun recordInflationIndex(repo: InflationIndexRepository): RecordInflationIndex =
        RecordInflationIndex(repo)

    @Bean
    fun getInflationIndex(repo: InflationIndexRepository): GetInflationIndex =
        GetInflationIndex(repo)

    @Bean
    fun computeInflationFactor(repo: InflationIndexRepository): ComputeInflationFactor =
        ComputeInflationFactor(repo)

    @Bean
    fun listInflationIndices(repo: InflationIndexRepository): ListInflationIndices =
        ListInflationIndices(repo)
}