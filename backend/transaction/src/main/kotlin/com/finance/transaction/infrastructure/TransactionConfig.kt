package com.finance.transaction.infrastructure

import com.finance.transaction.application.GetTransaction
import com.finance.transaction.application.ListAccountTransactions
import com.finance.transaction.application.RecordTransaction
import com.finance.transaction.domain.TransactionRepository
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class TransactionConfig {

    @Bean
    fun recordTransaction(transactionRepository: TransactionRepository): RecordTransaction =
        RecordTransaction(transactionRepository)

    @Bean
    fun getTransaction(transactionRepository: TransactionRepository): GetTransaction =
        GetTransaction(transactionRepository)

    @Bean
    fun listAccountTransactions(transactionRepository: TransactionRepository): ListAccountTransactions =
        ListAccountTransactions(transactionRepository)
}