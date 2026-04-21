package com.finance.userprofile.infrastructure

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import com.finance.shared.Currency
import com.finance.userprofile.application.GetUserProfile
import com.finance.userprofile.application.UpdateUserPreferences
import com.finance.userprofile.domain.UserProfile
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Past
import jakarta.validation.constraints.Size
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
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
        @field:JsonProperty("firstName")
        @field:NotBlank
        @field:Schema(example = "John")
        @field:Size(max = 255)
        val firstName: String,

        @field:JsonProperty("lastName")
        @field:NotBlank
        @field:Schema(example = "DOE")
        @field:Size(max = 255)
        val lastName: String,

        @field:JsonProperty("displayName")
        @field:NotBlank
        @field:Schema(example = "JohnDoe")
        @field:Size(max = 255)
        val displayName: String,

        @field:JsonProperty("preferredCurrency")
        @field:Schema(example = "USD")
        val preferredCurrency: Currency,

        @field:JsonProperty("birthDate")
        @field:Past(message = "Birth date must be in the past")
        @field:DateTimeFormat(pattern = "yyyy-MM-dd")
        @field:Schema(example = "1990-01-15")
        val birthDate: LocalDate?
    )

    data class UserProfileResponse(
        val id: UUID,
        val firstName: String,
        val lastName: String,
        val displayName: String,
        val preferredCurrency: Currency,
        val birthDate: LocalDate?
    )

    @GetMapping("/{userId}")
    fun get(@PathVariable userId: UUID): UserProfileResponse =
        getUserProfile.execute(userId).toResponse()

    @PutMapping("/{userId}/preferences")
    fun updatePreferences(
        @PathVariable userId: UUID,
        @Valid @RequestBody request: UpdatePreferencesRequest
    ): UserProfileResponse =
        updateUserPreferences.execute(
            UpdateUserPreferences.Command(
                userId = userId,
                firstName = request.firstName,
                lastName = request.lastName,
                displayName = request.displayName,
                preferredCurrency = request.preferredCurrency,
                birthDate = request.birthDate
            )
        ).toResponse()

    private fun UserProfile.toResponse() = UserProfileResponse(
        id = id,
        firstName = firstName,
        lastName = lastName,
        displayName = displayName,
        preferredCurrency = preferredCurrency,
        birthDate = birthDate
    )
}