package com.finance.inflation.application

import com.finance.inflation.domain.InflationIndex
import com.finance.inflation.domain.InflationIndexRepository
import com.finance.shared.Currency
import com.finance.shared.error.InvalidRequestException
import java.time.YearMonth
import java.util.UUID

class RecordInflationIndex(
    private val inflationIndexRepository: InflationIndexRepository
) {
    data class Command(
        val currency: Currency,
        val yearMonth: YearMonth,
        val indexValue: Long,
        val indexScale: Int
    )

    data class Result(val indexId: UUID)

    fun execute(command: Command): Result {
        if (command.indexValue <= 0) throw InvalidRequestException("Inflation index value must be positive")
        if (command.indexScale < 0) throw InvalidRequestException("Inflation index scale must be non-negative")

        val index = InflationIndex(
            id = UUID.randomUUID(),
            currency = command.currency,
            yearMonth = command.yearMonth,
            indexValue = command.indexValue,
            indexScale = command.indexScale
        )
        return Result(indexId = inflationIndexRepository.save(index).id)
    }
}