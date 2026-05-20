package com.finance.transaction.domain

import com.finance.account.domain.AccountType
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class AccountTransactionCompatibilityTest {

    @Test
    fun checkingAccountDisallowsSecuritiesTrades() {
        assertFalse(TransactionType.BUY.isAllowedFor(AccountType.CHECKING))
        assertFalse(TransactionType.SELL.isAllowedFor(AccountType.CHECKING))
        assertFalse(TransactionType.DIVIDEND.isAllowedFor(AccountType.CHECKING))
    }

    @Test
    fun checkingAccountAllowsCashMovements() {
        assertTrue(TransactionType.DEPOSIT.isAllowedFor(AccountType.CHECKING))
        assertTrue(TransactionType.WITHDRAWAL.isAllowedFor(AccountType.CHECKING))
        assertTrue(TransactionType.TRANSFER.isAllowedFor(AccountType.CHECKING))
    }

    @Test
    fun savingsAccountAllowsDividendForInterest() {
        assertTrue(TransactionType.DIVIDEND.isAllowedFor(AccountType.SAVINGS))
        assertFalse(TransactionType.BUY.isAllowedFor(AccountType.SAVINGS))
    }

    @Test
    fun brokerageAccountAllowsSecuritiesTrades() {
        assertTrue(TransactionType.BUY.isAllowedFor(AccountType.BROKERAGE))
        assertTrue(TransactionType.SELL.isAllowedFor(AccountType.BROKERAGE))
    }

    @Test
    fun otherAccountAllowsAllTransactionTypes() {
        TransactionType.entries.forEach { type ->
            assertTrue(type.isAllowedFor(AccountType.OTHER))
        }
    }

    @Test
    fun onlyBuyAndSellRequireAsset() {
        assertTrue(TransactionType.BUY.requiresAsset())
        assertTrue(TransactionType.SELL.requiresAsset())
        assertFalse(TransactionType.DEPOSIT.requiresAsset())
    }
}
