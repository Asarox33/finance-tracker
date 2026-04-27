package com.finance.fees.application

import com.finance.fees.domain.Fee
import com.finance.fees.domain.FeeRepository
import com.finance.shared.error.NotFoundException
import java.util.UUID

class GetFee(
    private val feeRepository: FeeRepository
) {
    fun execute(feeId: UUID): Fee =
        feeRepository.findById(feeId)
            ?: throw NotFoundException("Fee not found: $feeId")
}