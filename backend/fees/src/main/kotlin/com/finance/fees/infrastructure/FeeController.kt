package com.finance.fees.infrastructure

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import com.finance.fees.application.GetFee
import com.finance.fees.application.ListFees
import com.finance.fees.application.RecordFee
import com.finance.fees.domain.Fee
import com.finance.fees.domain.FeeType
import com.finance.shared.Currency
import com.finance.shared.PageResult
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Size
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate
import java.util.UUID

@RestController
@RequestMapping("/api/fees")
class FeeController(
    private val recordFee: RecordFee,
    private val getFee: GetFee,
    private val listFees: ListFees
) {
    data class RecordFeeRequest @JsonCreator constructor(
        @param:JsonProperty("accountId")
        @field:Schema(example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
        val accountId: UUID,

        @param:JsonProperty("transactionId")
        @field:Schema(example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
        val transactionId: UUID?,

        @param:JsonProperty("type")
        @field:Schema(example = "BROKERAGE")
        val type: FeeType,

        @param:JsonProperty("amount")
        @field:Positive
        @field:Schema(example = "199", description = "Amount in minor units (e.g. cents)")
        val amount: Long,

        @param:JsonProperty("currency")
        @field:Schema(example = "EUR")
        val currency: Currency,

        @param:JsonProperty("date")
        @field:DateTimeFormat(pattern = "yyyy-MM-dd")
        @field:Schema(example = "2024-01-15")
        val date: LocalDate,

        @param:JsonProperty("label")
        @field:NotBlank
        @field:Size(max = 255)
        @field:Schema(example = "Brokerage fee")
        val label: String
    )

    data class FeeResponse(
        val id: UUID,
        val accountId: UUID?,
        val transactionId: UUID?,
        val type: FeeType,
        val amount: Long,
        val currency: Currency,
        val date: LocalDate,
        val label: String
    )

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun record(
        @AuthenticationPrincipal _userId: String,
        @Valid @RequestBody request: RecordFeeRequest
    ): FeeResponse {
        val result = recordFee.execute(
            RecordFee.Command(
                accountId = request.accountId,
                transactionId = request.transactionId,
                type = request.type,
                amount = request.amount,
                currency = request.currency,
                date = request.date,
                label = request.label
            )
        )
        return getFee.execute(result.feeId).toResponse()
    }

    @GetMapping("/{feeId}")
    fun get(
        @AuthenticationPrincipal _userId: String,
        @PathVariable feeId: UUID
    ): FeeResponse = getFee.execute(feeId).toResponse()

    @GetMapping
    fun list(
        @AuthenticationPrincipal _userId: String,
        @RequestParam accountId: UUID,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") pageSize: Int
    ): PageResult<FeeResponse> {
        val result = listFees.execute(ListFees.Query(accountId, page, pageSize))
        return PageResult.of(result.items.map { it.toResponse() }, page, pageSize, result.totalItems)
    }

    private fun Fee.toResponse() = FeeResponse(
        id = id,
        accountId = accountId,
        transactionId = transactionId,
        type = type,
        amount = amount,
        currency = currency,
        date = date,
        label = label
    )
}