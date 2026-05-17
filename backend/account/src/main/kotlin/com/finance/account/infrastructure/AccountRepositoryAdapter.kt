package com.finance.account.infrastructure

import com.finance.account.domain.Account
import com.finance.account.domain.AccountRepository
import com.finance.account.domain.AccountStatus
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class AccountRepositoryAdapter(
    private val jpaRepo: JpaAccountSpringRepository
) : AccountRepository {

    override fun save(account: Account): Account {
        val entity = jpaRepo.findById(account.id).orElse(null)
            ?.also {
                it.name = account.name
                it.status = account.status
            }
            ?: JpaAccountEntity(
                id = account.id,
                userId = account.userId,
                institutionId = account.institutionId,
                name = account.name,
                type = account.type,
                currency = account.currency,
                status = account.status
            )
        return jpaRepo.save(entity).toDomain()
    }

    override fun findById(id: UUID): Account? =
        jpaRepo.findById(id).orElse(null)?.toDomain()

    override fun findByUserId(userId: UUID, page: Int, pageSize: Int): List<Account> =
        jpaRepo.findByUserId(userId, PageRequest.of(page, pageSize)).content.map { it.toDomain() }

    override fun countByUserId(userId: UUID): Long =
        jpaRepo.countByUserId(userId)

    override fun findByUserIdAndStatus(
        userId: UUID,
        status: AccountStatus,
        page: Int,
        pageSize: Int
    ): List<Account> =
        jpaRepo.findByUserIdAndStatus(userId, status, PageRequest.of(page, pageSize)).content.map { it.toDomain() }

    override fun countByUserIdAndStatus(userId: UUID, status: AccountStatus): Long =
        jpaRepo.countByUserIdAndStatus(userId, status)
}

private fun JpaAccountEntity.toDomain() = Account(
    id = id,
    userId = userId,
    institutionId = institutionId,
    name = name,
    type = type,
    currency = currency,
    status = status
)