package com.finance.auth.infrastructure

import com.finance.auth.application.AuthenticateUser
import com.finance.auth.application.RegisterUser
import jakarta.validation.Valid
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import org.springframework.http.HttpStatus
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
    private val authenticateUser: AuthenticateUser
) {
    data class RegisterRequest(
        @field:Email @field:NotBlank val email: String,
        @field:NotBlank val password: String
    )

    data class RegisterResponse(val userId: UUID)

    data class LoginRequest(
        @field:NotBlank val email: String,
        @field:NotBlank val password: String
    )

    data class LoginResponse(val token: String)

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
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
}