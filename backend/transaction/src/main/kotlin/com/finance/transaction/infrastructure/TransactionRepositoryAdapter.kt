package com.finance.transaction.infrastructure

import com.finance.transaction.domain.Transaction
import com.finance.transaction.domain.TransactionRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.util.UUID

@Component
class TransactionRepositoryAdapter(
    private val jpaRepo: JpaTransactionSpringRepository
) : TransactionRepository {

    override fun save(transaction: Transaction): Transaction {
        val entity = JpaTransactionEntity(
            id = transaction.id,
            accountId = transaction.accountId,
            assetId = transaction.assetId,
            type = transaction.type,
            amount = transaction.amount,
            currency = transaction.currency,
            date = transaction.date,
            label = transaction.label,
            notes = transaction.notes
        )
        return jpaRepo.save(entity).toDomain()
    }

    override fun findById(id: UUID): Transaction? =
        jpaRepo.findById(id).orElse(null)?.toDomain()

    override fun findByAccountId(accountId: UUID, page: Int, pageSize: Int): List<Transaction> =
        jpaRepo.findByAccountId(accountId, PageRequest.of(page, pageSize)).content.map { it.toDomain() }

    override fun countByAccountId(accountId: UUID): Long =
        jpaRepo.countByAccountId(accountId)

    override fun findByAccountIdAndDateBetween(
        accountId: UUID,
        from: LocalDate,
        to: LocalDate,
        page: Int,
        pageSize: Int
    ): List<Transaction> =
        jpaRepo.findByAccountIdAndDateBetween(
            accountId, from, to, PageRequest.of(page, pageSize)
        ).content.map { it.toDomain() }

    override fun countByAccountIdAndDateBetween(
        accountId: UUID,
        from: LocalDate,
        to: LocalDate
    ): Long = jpaRepo.countByAccountIdAndDateBetween(accountId, from, to)
}

private fun JpaTransactionEntity.toDomain() = Transaction(
    id = id,
    accountId = accountId,
    assetId = assetId,
    type = type,
    amount = amount,
    currency = currency,
    date = date,
    label = label,
    notes = notes
)