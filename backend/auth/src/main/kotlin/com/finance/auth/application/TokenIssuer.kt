package com.finance.auth.application

import com.finance.auth.domain.AuthToken
import java.util.UUID

interface TokenIssuer {
    fun issue(userId: UUID): AuthToken
}