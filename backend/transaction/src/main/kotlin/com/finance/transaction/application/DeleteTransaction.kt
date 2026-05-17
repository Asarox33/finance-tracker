package com.finance.transaction.application

import com.finance.shared.error.NotFoundException
import com.finance.transaction.domain.TransactionRepository
import com.finance.transaction.domain.TransactionStatus
import com.finance.transaction.domain.ports.AccountAccessPort
import java.util.UUID

class DeleteTransaction(
    private val transactionRepository: TransactionRepository,
    private val accountAccessPort: AccountAccessPort
) {
    data class Command(val transactionId: UUID, val requestingUserId: UUID)

    fun execute(command: Command) {
        val transaction = transactionRepository.findById(command.transactionId)
            ?: throw NotFoundException("Transaction not found: ${command.transactionId}")
        if (transaction.status == TransactionStatus.DELETED) {
            throw NotFoundException("Transaction not found: ${command.transactionId}")
        }
        accountAccessPort.findAccountForUser(transaction.accountId, command.requestingUserId)
            ?: throw NotFoundException("Transaction not found: ${command.transactionId}")
        transactionRepository.save(transaction.delete())
    }
}
