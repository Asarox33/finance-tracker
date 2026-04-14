package com.finance.auth.domain

import java.util.UUID

interface UserRepository {
    fun save(user: User): User
    fun findByEmail(email: String): User?
    fun findById(id: UUID): User?
    fun existsByEmail(email: String): Boolean
}