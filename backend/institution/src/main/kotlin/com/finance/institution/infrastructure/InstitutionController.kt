package com.finance.institution.infrastructure

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import com.finance.institution.application.CreateInstitution
import com.finance.institution.application.GetInstitution
import com.finance.institution.application.ListInstitutions
import com.finance.institution.domain.Institution
import com.finance.institution.domain.InstitutionType
import com.finance.shared.Country
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
@RequestMapping("/api/institutions")
class InstitutionController(
    private val createInstitution: CreateInstitution,
    private val getInstitution: GetInstitution,
    private val listInstitutions: ListInstitutions
) {
    data class CreateInstitutionRequest @JsonCreator constructor(
        @param:JsonProperty("name")
        @field:NotBlank
        @field:Size(max = 255)
        @field:Schema(example = "BNP Paribas")
        val name: String,

        @param:JsonProperty("type")
        @field:Schema(example = "BANK")
        val type: InstitutionType,

        @param:JsonProperty("country")
        @field:Schema(example = "FR")
        val country: Country,

        @param:JsonProperty("bic")
        @field:Size(min = 8, max = 11)
        @field:Schema(example = "BNPAFRPP")
        val bic: String?
    )

    data class InstitutionResponse(
        val id: UUID,
        val name: String,
        val type: InstitutionType,
        val country: Country,
        val bic: String?,
        val createdByUserId: UUID
    )

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(
        @AuthenticationPrincipal userId: String,
        @Valid @RequestBody request: CreateInstitutionRequest
    ): InstitutionResponse {
        val result = createInstitution.execute(
            CreateInstitution.Command(
                name = request.name,
                type = request.type,
                country = request.country,
                bic = request.bic,
                createdByUserId = UUID.fromString(userId)
            )
        )
        return getInstitution.execute(result.institutionId).toResponse()
    }

    @GetMapping("/{institutionId}")
    fun get(@PathVariable institutionId: UUID): InstitutionResponse =
        getInstitution.execute(institutionId).toResponse()

    @GetMapping
    fun list(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") pageSize: Int
    ): PageResult<InstitutionResponse> {
        val result = listInstitutions.execute(ListInstitutions.Query(page, pageSize))
        return PageResult.of(result.items.map { it.toResponse() }, page, pageSize, result.totalItems)
    }

    private fun Institution.toResponse() = InstitutionResponse(
        id = id,
        name = name,
        type = type,
        country = country,
        bic = bic,
        createdByUserId = createdByUserId
    )
}