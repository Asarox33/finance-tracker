package com.finance.analytics.infrastructure

import com.finance.analytics.application.ComputePerformance
import com.finance.analytics.application.ComputePerformanceAfterFees
import com.finance.analytics.application.ComputePerformanceAfterInflation
import com.finance.analytics.application.ComputePortfolioValue
import com.finance.analytics.domain.ports.AccountPort
import com.finance.analytics.domain.ports.AssetLabelPort
import com.finance.analytics.domain.ports.AssetMarkPricePort
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
        fxRatePort: FxRatePort,
        assetMarkPricePort: AssetMarkPricePort,
        assetLabelPort: AssetLabelPort
    ): ComputePortfolioValue = ComputePortfolioValue(
        accountPort,
        institutionPort,
        transactionPort,
        fxRatePort,
        assetMarkPricePort,
        assetLabelPort
    )

    @Bean
    fun computePerformance(
        accountPort: AccountPort,
        transactionPort: TransactionPort,
        fxRatePort: FxRatePort,
        assetMarkPricePort: AssetMarkPricePort
    ): ComputePerformance = ComputePerformance(accountPort, transactionPort, fxRatePort, assetMarkPricePort)

    @Bean
    fun computePerformanceAfterFees(
        accountPort: AccountPort,
        transactionPort: TransactionPort,
        feePort: FeePort,
        fxRatePort: FxRatePort,
        assetMarkPricePort: AssetMarkPricePort
    ): ComputePerformanceAfterFees =
        ComputePerformanceAfterFees(accountPort, transactionPort, feePort, fxRatePort, assetMarkPricePort)

    @Bean
    fun computePerformanceAfterInflation(
        accountPort: AccountPort,
        transactionPort: TransactionPort,
        feePort: FeePort,
        fxRatePort: FxRatePort,
        inflationPort: InflationPort,
        assetMarkPricePort: AssetMarkPricePort
    ): ComputePerformanceAfterInflation =
        ComputePerformanceAfterInflation(
            accountPort,
            transactionPort,
            feePort,
            fxRatePort,
            inflationPort,
            assetMarkPricePort
        )
}
