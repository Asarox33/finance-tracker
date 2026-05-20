package com.finance.asset.infrastructure

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import com.finance.asset.application.CreateAsset
import com.finance.asset.application.GetAsset
import com.finance.asset.application.ListAssets
import com.finance.asset.domain.Asset
import com.finance.asset.domain.AssetType
import com.finance.shared.Currency
import com.finance.shared.PageResult
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
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
import java.util.UUID

@RestController
@RequestMapping("/api/assets")
class AssetController(
    private val createAsset: CreateAsset,
    private val getAsset: GetAsset,
    private val listAssets: ListAssets
) {
    data class CreateAssetRequest @JsonCreator constructor(
        @param:JsonProperty("name")
        @field:NotBlank
        @field:Size(max = 255)
        @field:Schema(example = "Apple Inc.")
        val name: String,

        @param:JsonProperty("type")
        @field:Schema(example = "STOCK")
        val type: AssetType,

        @param:JsonProperty("currency")
        @field:Schema(example = "USD")
        val currency: Currency,

        @param:JsonProperty("isin")
        @field:Size(min = 12, max = 12)
        @field:Schema(example = "US0378331005")
        val isin: String?,

        @param:JsonProperty("ticker")
        @field:Size(max = 20)
        @field:Schema(example = "AAPL")
        val ticker: String?
    )

    data class AssetResponse(
        val id: UUID,
        val name: String,
        val type: AssetType,
        val currency: Currency,
        val isin: String?,
        val ticker: String?,
        val createdByUserId: UUID
    )

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(
        @AuthenticationPrincipal userId: String,
        @Valid @RequestBody request: CreateAssetRequest
    ): AssetResponse {
        val result = createAsset.execute(
            CreateAsset.Command(
                name = request.name,
                type = request.type,
                currency = request.currency,
                isin = request.isin,
                ticker = request.ticker,
                createdByUserId = UUID.fromString(userId)
            )
        )
        return getAsset.execute(result.assetId).toResponse()
    }

    @GetMapping("/{assetId}")
    fun get(@PathVariable assetId: UUID): AssetResponse =
        getAsset.execute(assetId).toResponse()

    @GetMapping
    fun list(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") pageSize: Int,
        @RequestParam(required = false) name: String?
    ): PageResult<AssetResponse> {
        val result = listAssets.execute(ListAssets.Query(page, pageSize, name))
        return PageResult.of(result.items.map { it.toResponse() }, page, pageSize, result.totalItems)
    }

    private fun Asset.toResponse() = AssetResponse(
        id = id,
        name = name,
        type = type,
        currency = currency,
        isin = isin,
        ticker = ticker,
        createdByUserId = createdByUserId
    )
}