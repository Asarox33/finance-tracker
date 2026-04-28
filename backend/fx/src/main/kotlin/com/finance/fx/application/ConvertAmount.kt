package com.finance.fx.application

import com.finance.fx.domain.FxConversion
import com.finance.fx.domain.FxRateRepository
import com.finance.shared.Currency
import com.finance.shared.error.InvalidRequestException
import com.finance.shared.error.NotFoundException
import java.time.LocalDate

class ConvertAmount(
    private val fxRateRepository: FxRateRepository,
    private val lookbackDays: Int
) {
    data class Command(
        val amount: Long,
        val sourceCurrency: Currency,
        val targetCurrency: Currency,
        val rateDate: LocalDate
    )

    fun execute(command: Command): FxConversion {
        if (command.sourceCurrency == command.targetCurrency) {
            throw InvalidRequestException("Source and target currency must differ")
        }
        if (command.amount == 0L) throw InvalidRequestException("Amount must not be zero")

        val rate = fxRateRepository.findByPairAndDate(
            command.sourceCurrency, command.targetCurrency, command.rateDate
        ) ?: fxRateRepository.findLatestByPairOnOrBefore(
            command.sourceCurrency, command.targetCurrency, command.rateDate, lookbackDays
        ) ?: throw NotFoundException(
            "No FX rate found for ${command.sourceCurrency}/${command.targetCurrency} " +
                    "on or before ${command.rateDate} within $lookbackDays days lookback"
        )

        val scale = pow10(rate.rateScale)
        val targetAmount = command.amount * rate.rate / scale

        return FxConversion(
            sourceAmount = command.amount,
            sourceCurrency = command.sourceCurrency,
            targetAmount = targetAmount,
            targetCurrency = command.targetCurrency,
            appliedRate = rate.rate,
            appliedRateScale = rate.rateScale,
            appliedRateDate = rate.appliedRateDate
        )
    }

    private fun pow10(exp: Int): Long {
        var result = 1L
        repeat(exp) { result *= 10L }
        return result
    }
}