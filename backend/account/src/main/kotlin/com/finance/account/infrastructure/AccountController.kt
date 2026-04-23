package com.finance.account.infrastructure

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import com.finance.account.application.CloseAccount
import com.finance.account.application.CreateAccount
import com.finance.account.application.GetAccount
import com.finance.account.application.ListUserAccounts
import com.finance.account.domain.Account
import com.finance.account.domain.AccountType
import com.finance.shared.Currency
import com.finance.shared.PageResult
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
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
import java.util.UUID

@RestController
@RequestMapping("/api/accounts")
class AccountController(
    private val createAccount: CreateAccount,
    private val getAccount: GetAccount,
    private val listUserAccounts: ListUserAccounts,
    private val closeAccount: CloseAccount
) {
    data class CreateAccountRequest @JsonCreator constructor(
        @param:JsonProperty("institutionId")
        @field:Schema(example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
        val institutionId: UUID,

        @param:JsonProperty("name")
        @field:NotBlank
        @field:Size(max = 255)
        @field:Schema(example = "My Savings Account")
        val name: String,

        @param:JsonProperty("type")
        @field:Schema(example = "SAVINGS")
        val type: AccountType,

        @param:JsonProperty("currency")
        @field:Schema(example = "EUR")
        val currency: Currency
    )

    data class AccountResponse(
        val id: UUID,
        val userId: UUID,
        val institutionId: UUID,
        val name: String,
        val type: AccountType,
        val currency: Currency,
        val status: String
    )

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(
        @AuthenticationPrincipal userId: String,
        @Valid @RequestBody request: CreateAccountRequest
    ): AccountResponse {
        val result = createAccount.execute(
            CreateAccount.Command(
                userId = UUID.fromString(userId),
                institutionId = request.institutionId,
                name = request.name,
                type = request.type,
                currency = request.currency
            )
        )
        return getAccount.execute(result.accountId).toResponse()
    }

    @GetMapping("/{accountId}")
    fun get(
        @AuthenticationPrincipal userId: String,
        @PathVariable accountId: UUID
    ): AccountResponse {
        val account = getAccount.execute(accountId)
        if (account.userId != UUID.fromString(userId)) {
            throw com.finance.shared.error.NotFoundException("Account not found: $accountId")
        }
        return account.toResponse()
    }

    @GetMapping
    fun listMine(
        @AuthenticationPrincipal userId: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") pageSize: Int
    ): PageResult<AccountResponse> {
        val result = listUserAccounts.execute(
            ListUserAccounts.Query(
                userId = UUID.fromString(userId),
                page = page,
                pageSize = pageSize
            )
        )
        return PageResult.of(result.items.map { it.toResponse() }, page, pageSize, result.totalItems)
    }

    @DeleteMapping("/{accountId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun close(
        @AuthenticationPrincipal userId: String,
        @PathVariable accountId: UUID
    ) {
        closeAccount.execute(
            CloseAccount.Command(
                accountId = accountId,
                requestingUserId = UUID.fromString(userId)
            )
        )
    }

    private fun Account.toResponse() = AccountResponse(
        id = id,
        userId = userId,
        institutionId = institutionId,
        name = name,
        type = type,
        currency = currency,
        status = status.name
    )
}