package com.finance.analytics

import com.finance.analytics.domain.ports.AccountPort
import com.finance.analytics.domain.ports.AccountSummary
import com.finance.analytics.domain.ports.FeePort
import com.finance.analytics.domain.ports.FeeSummary
import com.finance.analytics.domain.ports.FxRatePort
import com.finance.analytics.domain.ports.FxRateSummary
import com.finance.analytics.domain.ports.InflationFactorSummary
import com.finance.analytics.domain.ports.InflationPort
import com.finance.analytics.domain.ports.TransactionPort
import com.finance.analytics.domain.ports.TransactionSummary
import com.finance.shared.Currency
import java.time.LocalDate
import java.time.YearMonth
import java.util.UUID

class StubAccountPort(private val accounts: List<AccountSummary> = emptyList()) : AccountPort {
    override fun findActiveByUserId(userId: UUID): List<AccountSummary> = accounts
}

class StubTransactionPort(private val transactions: List<TransactionSummary> = emptyList()) : TransactionPort {
    override fun findByAccountId(userId: UUID, accountId: UUID, from: LocalDate, to: LocalDate): List<TransactionSummary> =
        transactions.filter { it.accountId == accountId && !it.date.isAfter(to) }
}

class StubFxRatePort(private val rate: FxRateSummary? = null) : FxRatePort {
    override fun getRate(source: Currency, target: Currency, date: LocalDate): FxRateSummary? = rate
}

class StubFeePort(private val fees: List<FeeSummary> = emptyList()) : FeePort {
    override fun findByAccountId(accountId: UUID, from: LocalDate, to: LocalDate): List<FeeSummary> =
        fees.filter { it.accountId == accountId && !it.date.isBefore(from) && !it.date.isAfter(to) }
}

class StubInflationPort(private val factor: InflationFactorSummary? = null) : InflationPort {
    override fun getFactor(currency: Currency, from: YearMonth, to: YearMonth): InflationFactorSummary? = factor
}

fun account(
    id: UUID = UUID.randomUUID(),
    currency: Currency = Currency.EUR
) = AccountSummary(id, currency, "ACTIVE")

fun transaction(
    accountId: UUID,
    amount: Long,
    currency: Currency = Currency.EUR,
    date: LocalDate = LocalDate.of(2024, 1, 15)
) = TransactionSummary(accountId, amount, currency, date, "DEPOSIT")

fun fee(
    accountId: UUID,
    amount: Long,
    currency: Currency = Currency.EUR,
    date: LocalDate = LocalDate.of(2024, 6, 1)
) = FeeSummary(accountId, amount, currency, date)