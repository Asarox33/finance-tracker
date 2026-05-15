package com.finance.auth.application

import com.finance.shared.error.ApplicationException

class AccountLockedException(message: String) : ApplicationException(message)

class RefreshTokenInvalidException(message: String = "Invalid or expired refresh token") :
    ApplicationException(message)