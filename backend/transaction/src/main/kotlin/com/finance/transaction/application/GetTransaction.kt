package com.finance.transaction.application

import com.finance.shared.error.NotFoundException
import com.finance.transaction.domain.Transaction
import com.finance.transaction.domain.TransactionRepository
import com.finance.transaction.domain.TransactionStatus
import com.finance.transaction.domain.ports.AccountAccessPort
import java.util.UUID

class GetTransaction(
    private val transactionRepository: TransactionRepository,
    private val accountAccessPort: AccountAccessPort
) {
    fun execute(transactionId: UUID, requestingUserId: UUID): Transaction {
        val transaction = transactionRepository.findById(transactionId)
            ?: throw NotFoundException("Transaction not found: $transactionId")
        if (transaction.status == TransactionStatus.DELETED) throw NotFoundException("Transaction not found: $transactionId")
        accountAccessPort.findAccountForUser(transaction.accountId, requestingUserId)
            ?: throw NotFoundException("Transaction not found: $transactionId")
        return transaction
    }
}