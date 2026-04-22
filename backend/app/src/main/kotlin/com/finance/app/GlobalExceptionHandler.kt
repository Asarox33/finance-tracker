package com.finance.app

import com.finance.auth.application.AccountLockedException
import com.finance.shared.error.AuthenticationFailedException
import com.finance.shared.error.BusinessRuleViolationException
import com.finance.shared.error.InvalidRequestException
import com.finance.shared.error.NotFoundException
import org.slf4j.LoggerFactory
import org.slf4j.MDC
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.servlet.resource.NoResourceFoundException

@RestControllerAdvice
class GlobalExceptionHandler {

    private val log = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)

    data class ErrorResponse(
        val message: String,
        val errors: List<String> = emptyList(),
        val correlationId: String? = MDC.get(CorrelationIdFilter.MDC_KEY)
    )

    @ExceptionHandler(NoResourceFoundException::class)
    fun handleNoResourceFound(): ResponseEntity<Void> =
        ResponseEntity.notFound().build()

    @ExceptionHandler(HttpMessageNotReadableException::class)
    fun handleNotReadable(ex: HttpMessageNotReadableException): ResponseEntity<ErrorResponse> {
        log.warn("Invalid request body: {}", ex.message)
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse(message = "Invalid request body: ${extractReadableMessage(ex)}"))
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidation(ex: MethodArgumentNotValidException): ResponseEntity<ErrorResponse> {
        val errors = ex.bindingResult.fieldErrors.map { "${it.field}: ${it.defaultMessage}" }
        log.warn("Validation failed: {}", errors)
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse(message = "Validation failed", errors = errors))
    }

    @ExceptionHandler(DataIntegrityViolationException::class)
    fun handleDataIntegrityViolation(ex: DataIntegrityViolationException): ResponseEntity<ErrorResponse> {
        log.warn("Data integrity violation: {}", ex.message)
        val message = when {
            ex.message?.contains("email", ignoreCase = true) == true ->
                "Email address is already registered"
            else -> "A data integrity constraint was violated"
        }
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(ErrorResponse(message = message))
    }

    @ExceptionHandler(AuthenticationFailedException::class)
    fun handleAuthenticationFailed(ex: AuthenticationFailedException): ResponseEntity<ErrorResponse> {
        log.warn("Authentication failed: {}", ex.message)
        return ResponseEntity
            .status(HttpStatus.UNAUTHORIZED)
            .body(ErrorResponse("Invalid credentials"))
    }

    @ExceptionHandler(AccountLockedException::class)
    fun handleAccountLocked(ex: AccountLockedException): ResponseEntity<ErrorResponse> {
        log.warn("Account locked: {}", ex.message)
        return ResponseEntity
            .status(HttpStatus.TOO_MANY_REQUESTS)
            .body(ErrorResponse("Account is temporarily locked. Try again later."))
    }

    @ExceptionHandler(InvalidRequestException::class)
    fun handleInvalidRequest(ex: InvalidRequestException): ResponseEntity<ErrorResponse> {
        log.warn("Invalid request: {}", ex.message)
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse(ex.message ?: "Invalid request"))
    }

    @ExceptionHandler(BusinessRuleViolationException::class)
    fun handleBusinessRuleViolation(ex: BusinessRuleViolationException): ResponseEntity<ErrorResponse> {
        log.warn("Business rule violation: {}", ex.message)
        return ResponseEntity
            .status(HttpStatus.UNPROCESSABLE_ENTITY)
            .body(ErrorResponse(ex.message ?: "Business rule violation"))
    }

    @ExceptionHandler(NotFoundException::class)
    fun handleNotFound(ex: NotFoundException): ResponseEntity<ErrorResponse> {
        log.warn("Resource not found: {}", ex.message)
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(ErrorResponse(ex.message ?: "Resource not found"))
    }

    @ExceptionHandler(Exception::class)
    fun handleUnexpected(ex: Exception): ResponseEntity<ErrorResponse> {
        log.error("Unexpected error: {}", ex.message, ex)
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ErrorResponse("An unexpected error occurred"))
    }

    private fun extractReadableMessage(ex: HttpMessageNotReadableException): String {
        val cause = ex.cause ?: return "Malformed JSON or invalid value"
        val message = cause.message ?: return "Malformed JSON or invalid value"

        val emptyStringMatch = Regex("""Cannot coerce empty String.*to `([^`]+)`""").find(message)
        if (emptyStringMatch != null) {
            val typeName = emptyStringMatch.groupValues[1].substringAfterLast(".")
            return "Invalid value: empty string is not allowed for field of type $typeName"
        }

        val enumMatch = Regex("""not one of the values accepted for Enum class: \[([^]]+)]""").find(message)
        if (enumMatch != null) {
            val field = Regex("""from String "([^"]+)"""").find(message)?.groupValues?.get(1) ?: "unknown"
            return "Invalid value \"$field\". Accepted values are: [${enumMatch.groupValues[1]}]"
        }

        return "Malformed JSON or invalid value"
    }
}