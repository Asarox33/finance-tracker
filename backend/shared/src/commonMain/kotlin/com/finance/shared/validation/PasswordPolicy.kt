package com.finance.shared.validation

public object PasswordPolicy {
    public const val MIN_LENGTH: Int = 12
    public const val MAX_LENGTH: Int = 128

    public fun validate(password: String): List<String> {
        val errors = mutableListOf<String>()
        if (password.length < MIN_LENGTH) errors.add("Password must be at least $MIN_LENGTH characters")
        if (password.length > MAX_LENGTH) errors.add("Password must be at most $MAX_LENGTH characters")
        if (!password.any { it.isUpperCase() }) errors.add("Password must contain at least one uppercase letter")
        if (!password.any { it.isLowerCase() }) errors.add("Password must contain at least one lowercase letter")
        if (!password.any { it.isDigit() }) errors.add("Password must contain at least one digit")
        if (!password.any { !it.isLetterOrDigit() }) errors.add("Password must contain at least one special character")
        return errors
    }

    public fun isValid(password: String): Boolean = validate(password).isEmpty()
}