package com.finance.account.domain

import java.util.UUID

interface AccountRepository {
    fun save(account: Account): Account
    fun findById(id: UUID): Account?
    fun findByUserId(userId: UUID, page: Int, pageSize: Int): List<Account>
    fun countByUserId(userId: UUID): Long
}