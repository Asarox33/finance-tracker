package com.finance.userprofile.infrastructure

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import com.finance.userprofile.application.GetUserProfile
import com.finance.userprofile.application.UpdateUserPreferences
import com.finance.userprofile.domain.UserProfile
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
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
        @JsonProperty("firstName") @field:NotBlank val firstName: String,
        @JsonProperty("lastName") @field:NotBlank val lastName: String,
        @JsonProperty("displayName") @field:NotBlank val displayName: String,
        @JsonProperty("preferredCurrency") @field:NotBlank @field:Size(min = 3, max = 3) val preferredCurrency: String,
        @JsonProperty("birthDate") val birthDate: LocalDate?
    )

    data class UserProfileResponse(
        val id: UUID,
        val firstName: String,
        val lastName: String,
        val displayName: String,
        val preferredCurrency: String,
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