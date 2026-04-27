package com.finance.fees.infrastructure

import com.finance.fees.domain.Fee
import com.finance.fees.domain.FeeRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class FeeRepositoryAdapter(
    private val jpaRepo: JpaFeeSpringRepository
) : FeeRepository {

    override fun save(fee: Fee): Fee {
        val entity = JpaFeeEntity(
            id = fee.id,
            accountId = fee.accountId,
            transactionId = fee.transactionId,
            type = fee.type,
            amount = fee.amount,
            currency = fee.currency,
            date = fee.date,
            label = fee.label
        )
        return jpaRepo.save(entity).toDomain()
    }

    override fun findById(id: UUID): Fee? =
        jpaRepo.findById(id).orElse(null)?.toDomain()

    override fun findByAccountId(accountId: UUID, page: Int, pageSize: Int): List<Fee> =
        jpaRepo.findByAccountId(accountId, PageRequest.of(page, pageSize)).content.map { it.toDomain() }

    override fun countByAccountId(accountId: UUID): Long =
        jpaRepo.countByAccountId(accountId)

    override fun findByTransactionId(transactionId: UUID): List<Fee> =
        jpaRepo.findByTransactionId(transactionId).map { it.toDomain() }
}

private fun JpaFeeEntity.toDomain() = Fee(
    id = id,
    accountId = accountId,
    transactionId = transactionId,
    type = type,
    amount = amount,
    currency = currency,
    date = date,
    label = label
)