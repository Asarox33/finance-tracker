package com.finance.auth.application

import com.finance.shared.error.ApplicationException

class AccountLockedException(message: String) : ApplicationException(message)