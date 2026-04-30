package com.finance.inflation.infrastructure

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import com.finance.inflation.application.ComputeInflationFactor
import com.finance.inflation.application.GetInflationIndex
import com.finance.inflation.application.RecordInflationIndex
import com.finance.inflation.domain.InflationIndex
import com.finance.shared.Currency
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.time.YearMonth
import java.util.UUID

@RestController
@RequestMapping("/api/inflation")
class InflationController(
    private val recordInflationIndex: RecordInflationIndex,
    private val getInflationIndex: GetInflationIndex,
    private val computeInflationFactor: ComputeInflationFactor
) {
    data class RecordInflationIndexRequest @JsonCreator constructor(
        @param:JsonProperty("currency")
        @field:Schema(example = "EUR")
        val currency: Currency,

        @param:JsonProperty("yearMonth")
        @field:Schema(example = "2024-01")
        val yearMonth: String,

        @param:JsonProperty("indexValue")
        @field:Schema(example = "11523", description = "Index value in minor units")
        val indexValue: Long,

        @param:JsonProperty("indexScale")
        @field:Schema(example = "2", description = "Scale: 11523 with scale 2 = 115.23")
        val indexScale: Int
    )

    data class InflationIndexResponse(
        val id: UUID,
        val currency: Currency,
        val yearMonth: String,
        val indexValue: Long,
        val indexScale: Int
    )

    data class InflationFactorResponse(
        val factor: Long,
        val factorScale: Int,
        val fromIndex: Long,
        val fromIndexScale: Int,
        val fromYearMonth: String,
        val toIndex: Long,
        val toIndexScale: Int,
        val toYearMonth: String
    )

    @PostMapping("/indices")
    @ResponseStatus(HttpStatus.CREATED)
    fun record(
        @AuthenticationPrincipal _userId: String,
        @Valid @RequestBody request: RecordInflationIndexRequest
    ): InflationIndexResponse {
        val yearMonth = YearMonth.parse(request.yearMonth)
        recordInflationIndex.execute(
            RecordInflationIndex.Command(
                currency = request.currency,
                yearMonth = yearMonth,
                indexValue = request.indexValue,
                indexScale = request.indexScale
            )
        )
        return getInflationIndex.execute(
            GetInflationIndex.Query(request.currency, yearMonth)
        ).toResponse()
    }

    @GetMapping("/indices")
    fun get(
        @AuthenticationPrincipal _userId: String,
        @RequestParam currency: Currency,
        @RequestParam yearMonth: String
    ): InflationIndexResponse =
        getInflationIndex.execute(
            GetInflationIndex.Query(currency, YearMonth.parse(yearMonth))
        ).toResponse()

    @GetMapping("/factor")
    fun factor(
        @AuthenticationPrincipal _userId: String,
        @RequestParam currency: Currency,
        @RequestParam from: String,
        @RequestParam to: String
    ): InflationFactorResponse {
        val result = computeInflationFactor.execute(
            ComputeInflationFactor.Query(currency, YearMonth.parse(from), YearMonth.parse(to))
        )
        return InflationFactorResponse(
            factor = result.factor,
            factorScale = result.factorScale,
            fromIndex = result.fromIndex,
            fromIndexScale = result.fromIndexScale,
            fromYearMonth = result.fromYearMonth.toString(),
            toIndex = result.toIndex,
            toIndexScale = result.toIndexScale,
            toYearMonth = result.toYearMonth.toString()
        )
    }

    private fun InflationIndex.toResponse() = InflationIndexResponse(
        id = id,
        currency = currency,
        yearMonth = yearMonth.toString(),
        indexValue = indexValue,
        indexScale = indexScale
    )
}