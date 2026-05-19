package com.finance.auth.application

import java.util.UUID

interface SessionTimeoutPort {
    fun getSessionTimeoutMinutes(userId: UUID): Int
}
