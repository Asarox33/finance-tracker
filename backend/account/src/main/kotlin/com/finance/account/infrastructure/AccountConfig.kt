package com.finance.account.infrastructure

import com.finance.account.application.CloseAccount
import com.finance.account.application.CreateAccount
import com.finance.account.application.GetAccount
import com.finance.account.application.ListUserAccounts
import com.finance.account.domain.AccountRepository
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class AccountConfig {

    @Bean
    fun createAccount(accountRepository: AccountRepository): CreateAccount =
        CreateAccount(accountRepository)

    @Bean
    fun getAccount(accountRepository: AccountRepository): GetAccount =
        GetAccount(accountRepository)

    @Bean
    fun listUserAccounts(accountRepository: AccountRepository): ListUserAccounts =
        ListUserAccounts(accountRepository)

    @Bean
    fun closeAccount(accountRepository: AccountRepository): CloseAccount =
        CloseAccount(accountRepository)
}