package com.finance.transaction.infrastructure

import com.finance.transaction.domain.Transaction
import com.finance.transaction.domain.TransactionRepository
import com.finance.transaction.domain.TransactionStatus
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
            notes = transaction.notes,
            status = transaction.status,
            appliedFxRate = transaction.appliedFxRate,
            appliedFxRateScale = transaction.appliedFxRateScale,
            appliedFxRateDate = transaction.appliedFxRateDate,
            appliedFxSourceCurrency = transaction.appliedFxSourceCurrency,
            appliedFxTargetCurrency = transaction.appliedFxTargetCurrency
        )
        return jpaRepo.save(entity).toDomain()
    }

    override fun findById(id: UUID): Transaction? =
        jpaRepo.findById(id).orElse(null)?.toDomain()

    override fun findByAccountId(accountId: UUID, page: Int, pageSize: Int): List<Transaction> =
        jpaRepo.findByAccountIdAndStatus(
            accountId,
            TransactionStatus.ACTIVE,
            PageRequest.of(page, pageSize)
        ).content.map { it.toDomain() }

    override fun countByAccountId(accountId: UUID): Long =
        jpaRepo.countByAccountIdAndStatus(accountId, TransactionStatus.ACTIVE)

    override fun findByAccountIdAndDateBetween(
        accountId: UUID,
        from: LocalDate,
        to: LocalDate,
        page: Int,
        pageSize: Int
    ): List<Transaction> =
        jpaRepo.findByAccountIdAndStatusAndDateBetween(
            accountId, TransactionStatus.ACTIVE, from, to, PageRequest.of(page, pageSize)
        ).content.map { it.toDomain() }

    override fun countByAccountIdAndDateBetween(
        accountId: UUID,
        from: LocalDate,
        to: LocalDate
    ): Long = jpaRepo.countByAccountIdAndStatusAndDateBetween(accountId, TransactionStatus.ACTIVE, from, to)
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
    notes = notes,
    status = status,
    appliedFxRate = appliedFxRate,
    appliedFxRateScale = appliedFxRateScale,
    appliedFxRateDate = appliedFxRateDate,
    appliedFxSourceCurrency = appliedFxSourceCurrency,
    appliedFxTargetCurrency = appliedFxTargetCurrency
)