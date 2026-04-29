package com.finance.fx.infrastructure

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import com.finance.fx.application.ConvertAmount
import com.finance.fx.application.GetFxRate
import com.finance.fx.application.RecordFxRate
import com.finance.fx.domain.FxConversion
import com.finance.fx.domain.FxRate
import com.finance.shared.Currency
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.Valid
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate
import java.util.UUID

@RestController
@RequestMapping("/api/fx")
class FxController(
    private val recordFxRate: RecordFxRate,
    private val getFxRate: GetFxRate,
    private val convertAmount: ConvertAmount
) {
    data class RecordFxRateRequest @JsonCreator constructor(
        @param:JsonProperty("sourceCurrency")
        @field:Schema(example = "USD")
        val sourceCurrency: Currency,

        @param:JsonProperty("targetCurrency")
        @field:Schema(example = "EUR")
        val targetCurrency: Currency,

        @param:JsonProperty("rate")
        @field:Schema(example = "91500", description = "Rate in minor units with scale (e.g. 91500 with scale 5 = 0.91500)")
        val rate: Long,

        @param:JsonProperty("rateScale")
        @field:Schema(example = "5")
        val rateScale: Int,

        @param:JsonProperty("date")
        @field:DateTimeFormat(pattern = "yyyy-MM-dd")
        @field:Schema(example = "2024-01-15")
        val date: LocalDate
    )

    data class FxRateResponse(
        val id: UUID,
        val sourceCurrency: Currency,
        val targetCurrency: Currency,
        val rate: Long,
        val rateScale: Int,
        val date: LocalDate,
        val appliedRateDate: LocalDate
    )

    data class ConvertRequest @JsonCreator constructor(
        @param:JsonProperty("amount")
        @field:Schema(example = "10000")
        val amount: Long,

        @param:JsonProperty("sourceCurrency")
        @field:Schema(example = "USD")
        val sourceCurrency: Currency,

        @param:JsonProperty("targetCurrency")
        @field:Schema(example = "EUR")
        val targetCurrency: Currency,

        @param:JsonProperty("rateDate")
        @field:DateTimeFormat(pattern = "yyyy-MM-dd")
        @field:Schema(example = "2024-01-15")
        val rateDate: LocalDate
    )

    data class ConversionResponse(
        val sourceAmount: Long,
        val sourceCurrency: Currency,
        val targetAmount: Long,
        val targetCurrency: Currency,
        val appliedRate: Long,
        val appliedRateScale: Int,
        val appliedRateDate: LocalDate
    )

    @PostMapping("/rates")
    @ResponseStatus(HttpStatus.CREATED)
    fun record(
        @AuthenticationPrincipal _userId: String,
        @Valid @RequestBody request: RecordFxRateRequest
    ): FxRateResponse {
        recordFxRate.execute(
            RecordFxRate.Command(
                sourceCurrency = request.sourceCurrency,
                targetCurrency = request.targetCurrency,
                rate = request.rate,
                rateScale = request.rateScale,
                date = request.date
            )
        )
        return getFxRate.execute(
            GetFxRate.Query(request.sourceCurrency, request.targetCurrency, request.date)
        ).toResponse()
    }

    @GetMapping("/rates")
    fun getRate(
        @AuthenticationPrincipal _userId: String,
        @RequestParam sourceCurrency: Currency,
        @RequestParam targetCurrency: Currency,
        @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") date: LocalDate
    ): FxRateResponse =
        getFxRate.execute(GetFxRate.Query(sourceCurrency, targetCurrency, date)).toResponse()

    @PostMapping("/convert")
    fun convert(
        @AuthenticationPrincipal _userId: String,
        @Valid @RequestBody request: ConvertRequest
    ): ConversionResponse =
        convertAmount.execute(
            ConvertAmount.Command(
                amount = request.amount,
                sourceCurrency = request.sourceCurrency,
                targetCurrency = request.targetCurrency,
                rateDate = request.rateDate
            )
        ).toResponse()

    private fun FxRate.toResponse() = FxRateResponse(
        id = id,
        sourceCurrency = sourceCurrency,
        targetCurrency = targetCurrency,
        rate = rate,
        rateScale = rateScale,
        date = date,
        appliedRateDate = appliedRateDate
    )

    private fun FxConversion.toResponse() = ConversionResponse(
        sourceAmount = sourceAmount,
        sourceCurrency = sourceCurrency,
        targetAmount = targetAmount,
        targetCurrency = targetCurrency,
        appliedRate = appliedRate,
        appliedRateScale = appliedRateScale,
        appliedRateDate = appliedRateDate
    )
}