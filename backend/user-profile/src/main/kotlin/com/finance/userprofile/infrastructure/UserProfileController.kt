package com.finance.userprofile.infrastructure

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import com.finance.shared.Currency
import com.finance.shared.DisplayLanguage
import com.finance.userprofile.application.GetUserProfile
import com.finance.userprofile.application.UpdateUserPreferences
import com.finance.userprofile.domain.UserProfile
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Past
import jakarta.validation.constraints.Size
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate
import java.util.UUID

@RestController
@RequestMapping("/api/users")
class UserProfileController(
    private val getUserProfile: GetUserProfile,
    private val updateUserPreferences: UpdateUserPreferences
) {
    data class UpdatePreferencesRequest @JsonCreator constructor(
        @param:JsonProperty("firstName")
        @field:NotBlank
        @field:Size(max = 255)
        @field:Schema(example = "John")
        val firstName: String,

        @param:JsonProperty("lastName")
        @field:NotBlank
        @field:Size(max = 255)
        @field:Schema(example = "DOE")
        val lastName: String,

        @param:JsonProperty("displayName")
        @field:NotBlank
        @field:Size(max = 255)
        @field:Schema(example = "JohnDoe")
        val displayName: String,

        @param:JsonProperty("preferredCurrency")
        @field:Schema(example = "EUR")
        val preferredCurrency: Currency,

        @param:JsonProperty("preferredLanguage")
        @field:Schema(example = "ENG")
        val preferredLanguage: DisplayLanguage,

        @param:JsonProperty("birthDate")
        @field:Past(message = "Birth date must be in the past")
        @field:DateTimeFormat(pattern = "yyyy-MM-dd")
        @field:Schema(example = "1990-01-15")
        val birthDate: LocalDate?,

        @param:JsonProperty("tablePageSize")
        @field:Schema(example = "20")
        val tablePageSize: Int,

        @param:JsonProperty("sessionTimeoutMinutes")
        @field:Schema(example = "10")
        val sessionTimeoutMinutes: Int
    )

    data class UserProfileResponse(
        val id: UUID,
        val firstName: String,
        val lastName: String,
        val displayName: String,
        val preferredCurrency: Currency,
        val preferredLanguage: DisplayLanguage,
        val birthDate: LocalDate?,
        val tablePageSize: Int,
        val sessionTimeoutMinutes: Int
    )

    @GetMapping("/me")
    fun getMe(@AuthenticationPrincipal userId: String): UserProfileResponse =
        getUserProfile.execute(UUID.fromString(userId)).toResponse()

    @PutMapping("/me/preferences")
    fun updateMyPreferences(
        @AuthenticationPrincipal userId: String,
        @Valid @RequestBody request: UpdatePreferencesRequest
    ): UserProfileResponse =
        updateUserPreferences.execute(
            UpdateUserPreferences.Command(
                userId = UUID.fromString(userId),
                firstName = request.firstName,
                lastName = request.lastName,
                displayName = request.displayName,
                preferredCurrency = request.preferredCurrency,
                preferredLanguage = request.preferredLanguage,
                birthDate = request.birthDate,
                tablePageSize = request.tablePageSize,
                sessionTimeoutMinutes = request.sessionTimeoutMinutes
            )
        ).toResponse()

    private fun UserProfile.toResponse() = UserProfileResponse(
        id = id,
        firstName = firstName,
        lastName = lastName,
        displayName = displayName,
        preferredCurrency = preferredCurrency,
        preferredLanguage = preferredLanguage,
        birthDate = birthDate,
        tablePageSize = tablePageSize,
        sessionTimeoutMinutes = sessionTimeoutMinutes
    )
}