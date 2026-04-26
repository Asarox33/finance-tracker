package com.finance.transaction.application

import com.finance.shared.error.NotFoundException
import com.finance.transaction.domain.Transaction
import com.finance.transaction.domain.TransactionRepository
import java.util.UUID

class GetTransaction(
    private val transactionRepository: TransactionRepository
) {
    fun execute(transactionId: UUID): Transaction =
        transactionRepository.findById(transactionId)
            ?: throw NotFoundException("Transaction not found: $transactionId")
}