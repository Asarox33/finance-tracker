package com.finance.analytics.infrastructure

import com.finance.analytics.application.ComputePerformance
import com.finance.analytics.application.ComputePerformanceAfterFees
import com.finance.analytics.application.ComputePerformanceAfterInflation
import com.finance.analytics.application.ComputePortfolioValue
import com.finance.analytics.domain.ports.AccountPort
import com.finance.analytics.domain.ports.FeePort
import com.finance.analytics.domain.ports.FxRatePort
import com.finance.analytics.domain.ports.InstitutionPort
import com.finance.analytics.domain.ports.InflationPort
import com.finance.analytics.domain.ports.TransactionPort
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class AnalyticsConfig {

    @Bean
    fun computePortfolioValue(
        accountPort: AccountPort,
        institutionPort: InstitutionPort,
        transactionPort: TransactionPort,
        fxRatePort: FxRatePort
    ): ComputePortfolioValue = ComputePortfolioValue(accountPort, institutionPort, transactionPort, fxRatePort)

    @Bean
    fun computePerformance(
        accountPort: AccountPort,
        transactionPort: TransactionPort,
        fxRatePort: FxRatePort
    ): ComputePerformance = ComputePerformance(accountPort, transactionPort, fxRatePort)

    @Bean
    fun computePerformanceAfterFees(
        accountPort: AccountPort,
        transactionPort: TransactionPort,
        feePort: FeePort,
        fxRatePort: FxRatePort
    ): ComputePerformanceAfterFees =
        ComputePerformanceAfterFees(accountPort, transactionPort, feePort, fxRatePort)

    @Bean
    fun computePerformanceAfterInflation(
        accountPort: AccountPort,
        transactionPort: TransactionPort,
        feePort: FeePort,
        fxRatePort: FxRatePort,
        inflationPort: InflationPort
    ): ComputePerformanceAfterInflation =
        ComputePerformanceAfterInflation(accountPort, transactionPort, feePort, fxRatePort, inflationPort)
}