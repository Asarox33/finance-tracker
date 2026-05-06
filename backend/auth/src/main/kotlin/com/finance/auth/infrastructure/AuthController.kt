package com.finance.auth.infrastructure

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import com.finance.auth.application.AuthenticateUser
import com.finance.auth.application.RegisterUser
import com.finance.auth.application.RequestPasswordReset
import com.finance.auth.application.ResetPassword
import jakarta.validation.Valid
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.springframework.http.HttpStatus
import io.swagger.v3.oas.annotations.media.Schema
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val registerUser: RegisterUser,
    private val authenticateUser: AuthenticateUser,
    private val requestPasswordReset: RequestPasswordReset,
    private val resetPassword: ResetPassword
) {
    data class RegisterRequest @JsonCreator constructor(
        @param:JsonProperty("email")
        @field:Email
        @field:NotBlank
        @field:Schema(example = "user@example.com")
        @field:Size(max = 255)
        val email: String,

        @param:JsonProperty("password")
        @field:NotBlank
        @field:Schema(
            description = "User password (min 12 chars) with at least 1 Uppercase, 1 Lowercase, 1 figure, 1 special character",
            example = "MyStrongPassword123!"
        )
        @field:Size(min = 12, max = 128)
        val password: String
    )

    data class RegisterResponse(val userId: UUID)

    data class LoginRequest @JsonCreator constructor(
        @param:JsonProperty("email")
        @field:NotBlank
        @field:Schema(example = "user@example.com")
        @field:Size(max = 255)
        val email: String,

        @param:JsonProperty("password")
        @field:NotBlank
        @field:Schema(
            description = "User password (min 12 chars) with at least 1 Uppercase, 1 Lowercase, 1 figure, 1 special character",
            example = "MyStrongPassword123!"
        )
        @field:Size(min = 12, max = 128)
        val password: String
    )

    data class LoginResponse(val token: String)

    data class RequestPasswordResetRequest @JsonCreator constructor(
        @param:JsonProperty("email")
        @field:Email
        @field:NotBlank
        @field:Schema(example = "user@example.com")
        @field:Size(max = 255)
        val email: String
    )

    data class ResetPasswordRequest @JsonCreator constructor(
        @param:JsonProperty("email")
        @field:Email
        @field:NotBlank
        @field:Schema(example = "user@example.com")
        val email: String,

        @param:JsonProperty("otp")
        @field:NotBlank
        @field:Size(min = 6, max = 6)
        @field:Schema(example = "123456")
        val otp: String,

        @param:JsonProperty("newPassword")
        @field:NotBlank
        @field:Size(min = 12, max = 128)
        @field:Schema(example = "MyStrongPassword123!")
        val newPassword: String
    )

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    fun register(@Valid @RequestBody request: RegisterRequest): RegisterResponse {
        val result = registerUser.execute(
            RegisterUser.Command(email = request.email, rawPassword = request.password)
        )
        return RegisterResponse(userId = result.userId)
    }

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): LoginResponse {
        val token = authenticateUser.execute(
            AuthenticateUser.Command(email = request.email, rawPassword = request.password)
        )
        return LoginResponse(token = token.value)
    }

    @PostMapping("/password-reset/request")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun requestPasswordReset(@Valid @RequestBody request: RequestPasswordResetRequest) {
        requestPasswordReset.execute(RequestPasswordReset.Command(email = request.email))
    }

    @PostMapping("/password-reset/confirm")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun resetPassword(@Valid @RequestBody request: ResetPasswordRequest) {
        resetPassword.execute(
            ResetPassword.Command(
                email = request.email,
                rawOtp = request.otp,
                newPassword = request.newPassword
            )
        )
    }
}