package com.finance.transaction.infrastructure

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import com.finance.shared.Currency
import com.finance.shared.PageResult
import com.finance.transaction.application.DeleteTransaction
import com.finance.transaction.application.GetTransaction
import com.finance.transaction.application.ListAccountTransactions
import com.finance.transaction.application.RecordTransaction
import com.finance.transaction.domain.Transaction
import com.finance.transaction.domain.TransactionType
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.DeleteMapping
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
@RequestMapping("/api/transactions")
class TransactionController(
    private val recordTransaction: RecordTransaction,
    private val getTransaction: GetTransaction,
    private val listAccountTransactions: ListAccountTransactions,
    private val deleteTransaction: DeleteTransaction
) {
    data class RecordTransactionRequest @JsonCreator constructor(
        @param:JsonProperty("accountId")
        @field:Schema(example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
        val accountId: UUID,

        @param:JsonProperty("assetId")
        val assetId: UUID?,

        @param:JsonProperty("type")
        @field:Schema(example = "DEPOSIT")
        val type: TransactionType,

        @param:JsonProperty("amount")
        @field:Schema(example = "10000", description = "Amount in minor units (e.g. cents)")
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
        @field:Schema(example = "Monthly salary")
        val label: String,

        @param:JsonProperty("notes")
        @field:Size(max = 1000)
        val notes: String?,

        @param:JsonProperty("appliedFxRate")
        @field:Schema(example = "91500", description = "FX rate in minor units at transaction time")
        val appliedFxRate: Long? = null,

        @param:JsonProperty("appliedFxRateScale")
        @field:Schema(example = "5")
        val appliedFxRateScale: Int? = null,

        @param:JsonProperty("appliedFxRateDate")
        @field:DateTimeFormat(pattern = "yyyy-MM-dd")
        @field:Schema(example = "2024-01-15")
        val appliedFxRateDate: LocalDate? = null,

        @param:JsonProperty("appliedFxSourceCurrency")
        @field:Schema(example = "USD")
        val appliedFxSourceCurrency: Currency? = null,

        @param:JsonProperty("appliedFxTargetCurrency")
        @field:Schema(example = "EUR")
        val appliedFxTargetCurrency: Currency? = null
    )

    data class TransactionResponse(
        val id: UUID,
        val accountId: UUID,
        val assetId: UUID?,
        val type: TransactionType,
        val amount: Long,
        val currency: Currency,
        val date: LocalDate,
        val label: String,
        val notes: String?,
        val appliedFxRate: Long?,
        val appliedFxRateScale: Int?,
        val appliedFxRateDate: LocalDate?,
        val appliedFxSourceCurrency: Currency?,
        val appliedFxTargetCurrency: Currency?
    )

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun record(
        @AuthenticationPrincipal userId: String,
        @Valid @RequestBody request: RecordTransactionRequest
    ): TransactionResponse {
        val transactionId = recordTransaction.execute(
            RecordTransaction.Command(
                requestingUserId = UUID.fromString(userId),
                accountId = request.accountId,
                assetId = request.assetId,
                type = request.type,
                amount = request.amount,
                currency = request.currency,
                date = request.date,
                label = request.label,
                notes = request.notes,
                appliedFxRate = request.appliedFxRate,
                appliedFxRateScale = request.appliedFxRateScale,
                appliedFxRateDate = request.appliedFxRateDate,
                appliedFxSourceCurrency = request.appliedFxSourceCurrency,
                appliedFxTargetCurrency = request.appliedFxTargetCurrency
            )
        ).transactionId
        return getTransaction.execute(transactionId, UUID.fromString(userId)).toResponse()
    }

    @GetMapping("/{transactionId}")
    fun get(
        @AuthenticationPrincipal userId: String,
        @PathVariable transactionId: UUID
    ): TransactionResponse =
        getTransaction.execute(transactionId, UUID.fromString(userId)).toResponse()

    @GetMapping
    fun list(
        @AuthenticationPrincipal userId: String,
        @RequestParam accountId: UUID,
        @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") from: LocalDate?,
        @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") to: LocalDate?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") pageSize: Int
    ): PageResult<TransactionResponse> {
        val result = listAccountTransactions.execute(
            ListAccountTransactions.Query(UUID.fromString(userId), accountId, from, to, page, pageSize)
        )
        return PageResult.of(result.items.map { it.toResponse() }, page, pageSize, result.totalItems)
    }

    @DeleteMapping("/{transactionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(
        @AuthenticationPrincipal userId: String,
        @PathVariable transactionId: UUID
    ) {
        deleteTransaction.execute(DeleteTransaction.Command(transactionId, UUID.fromString(userId)))
    }

    private fun Transaction.toResponse() = TransactionResponse(
        id = id,
        accountId = accountId,
        assetId = assetId,
        type = type,
        amount = amount,
        currency = currency,
        date = date,
        label = label,
        notes = notes,
        appliedFxRate = appliedFxRate,
        appliedFxRateScale = appliedFxRateScale,
        appliedFxRateDate = appliedFxRateDate,
        appliedFxSourceCurrency = appliedFxSourceCurrency,
        appliedFxTargetCurrency = appliedFxTargetCurrency
    )
}