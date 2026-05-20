package com.finance.transaction.infrastructure

import com.finance.transaction.application.DeleteTransaction
import com.finance.transaction.application.GetTransaction
import com.finance.transaction.application.ListAccountTransactions
import com.finance.transaction.application.RecordTransaction
import com.finance.transaction.domain.TransactionRepository
import com.finance.transaction.domain.ports.AccountAccessPort
import com.finance.transaction.domain.ports.AssetTradePricingPort
import org.springframework.beans.factory.ObjectProvider
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class TransactionConfig {

    @Bean
    fun recordTransaction(
        transactionRepository: TransactionRepository,
        accountAccessPort: AccountAccessPort,
        assetTradePricingPort: ObjectProvider<AssetTradePricingPort>
    ): RecordTransaction =
        RecordTransaction(
            transactionRepository,
            accountAccessPort,
            assetTradePricingPort.getIfAvailable()
        )

    @Bean
    fun getTransaction(
        transactionRepository: TransactionRepository,
        accountAccessPort: AccountAccessPort
    ): GetTransaction =
        GetTransaction(transactionRepository, accountAccessPort)

    @Bean
    fun listAccountTransactions(
        transactionRepository: TransactionRepository,
        accountAccessPort: AccountAccessPort
    ): ListAccountTransactions =
        ListAccountTransactions(transactionRepository, accountAccessPort)

    @Bean
    fun deleteTransaction(
        transactionRepository: TransactionRepository,
        accountAccessPort: AccountAccessPort
    ): DeleteTransaction =
        DeleteTransaction(transactionRepository, accountAccessPort)
}