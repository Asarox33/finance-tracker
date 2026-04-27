package com.finance.fees.application

import com.finance.fees.InMemoryFeeRepository
import com.finance.fees.testFee
import com.finance.shared.error.NotFoundException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.util.UUID

class GetFeeTest {

    private val repository = InMemoryFeeRepository()
    private val useCase = GetFee(repository)

    @Test
    fun returnsExistingFee() {
        val id = UUID.randomUUID()
        repository.save(testFee(id = id))
        assertEquals(id, useCase.execute(id).id)
    }

    @Test
    fun throwsNotFoundForUnknownFee() {
        assertThrows(NotFoundException::class.java) { useCase.execute(UUID.randomUUID()) }
    }
}