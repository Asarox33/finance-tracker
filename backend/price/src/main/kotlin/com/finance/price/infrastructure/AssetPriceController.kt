package com.finance.price.infrastructure

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import com.finance.price.application.GetAssetPrice
import com.finance.price.application.ListAssetPrices
import com.finance.price.application.RecordAssetPrice
import com.finance.price.domain.AssetPrice
import com.finance.shared.Currency
import com.finance.shared.PageResult
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.Valid
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import java.time.LocalDate
import java.util.UUID

@RestController
@RequestMapping("/api/prices")
class AssetPriceController(
    private val recordAssetPrice: RecordAssetPrice,
    private val getAssetPrice: GetAssetPrice,
    private val listAssetPrices: ListAssetPrices
) {
    data class RecordAssetPriceRequest @JsonCreator constructor(
        @param:JsonProperty("assetId")
        @field:Schema(example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
        val assetId: UUID,

        @param:JsonProperty("price")
        @field:Schema(example = "15000", description = "Price in minor units (e.g. cents)")
        val price: Long,

        @param:JsonProperty("currency")
        @field:Schema(example = "USD")
        val currency: Currency,

        @param:JsonProperty("date")
        @field:DateTimeFormat(pattern = "yyyy-MM-dd")
        @field:Schema(example = "2024-01-15")
        val date: LocalDate
    )

    data class AssetPriceResponse(
        val id: UUID,
        val assetId: UUID,
        val price: Long,
        val currency: Currency,
        val date: LocalDate,
        val appliedPriceDate: LocalDate
    )

    @PostMapping
    fun record(@Valid @RequestBody request: RecordAssetPriceRequest): ResponseEntity<AssetPriceResponse> {
        val outcome = recordAssetPrice.execute(
            RecordAssetPrice.Command(
                assetId = request.assetId,
                price = request.price,
                currency = request.currency,
                date = request.date
            )
        )
        val body = getAssetPrice.execute(
            GetAssetPrice.Query(request.assetId, request.date)
        ).toResponse()
        val status = if (outcome.created) HttpStatus.CREATED else HttpStatus.OK
        return ResponseEntity.status(status).body(body)
    }

    @GetMapping
    fun get(
        @RequestParam assetId: UUID,
        @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") date: LocalDate
    ): AssetPriceResponse =
        getAssetPrice.execute(GetAssetPrice.Query(assetId, date)).toResponse()

    @GetMapping("/history")
    fun list(
        @RequestParam assetId: UUID,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") pageSize: Int
    ): PageResult<AssetPriceResponse> {
        val result = listAssetPrices.execute(ListAssetPrices.Query(assetId, page, pageSize))
        return PageResult.of(result.items.map { it.toResponse() }, page, pageSize, result.totalItems)
    }

    private fun AssetPrice.toResponse() = AssetPriceResponse(
        id = id,
        assetId = assetId,
        price = price,
        currency = currency,
        date = date,
        appliedPriceDate = appliedPriceDate
    )
}