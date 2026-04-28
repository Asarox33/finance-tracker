package com.finance.fx.application

import com.finance.fx.domain.FxRate
import com.finance.fx.domain.FxRateRepository
import com.finance.shared.Currency
import com.finance.shared.error.InvalidRequestException
import java.time.LocalDate
import java.util.UUID

class RecordFxRate(
    private val fxRateRepository: FxRateRepository
) {
    data class Command(
        val sourceCurrency: Currency,
        val targetCurrency: Currency,
        val rate: Long,
        val rateScale: Int,
        val date: LocalDate
    )

    data class Result(val rateId: UUID)

    fun execute(command: Command): Result {
        if (command.sourceCurrency == command.targetCurrency) {
            throw InvalidRequestException("Source and target currency must differ")
        }
        if (command.rate <= 0) throw InvalidRequestException("FX rate must be positive")
        if (command.rateScale < 0) throw InvalidRequestException("Rate scale must be non-negative")

        val fxRate = FxRate(
            id = UUID.randomUUID(),
            sourceCurrency = command.sourceCurrency,
            targetCurrency = command.targetCurrency,
            rate = command.rate,
            rateScale = command.rateScale,
            date = command.date
        )
        return Result(rateId = fxRateRepository.save(fxRate).id)
    }
}