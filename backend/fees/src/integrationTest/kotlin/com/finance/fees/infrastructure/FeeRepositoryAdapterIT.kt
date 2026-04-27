package com.finance.fees.infrastructure

import com.finance.fees.FeeTestApplication
import com.finance.fees.domain.Fee
import com.finance.fees.domain.FeeType
import com.finance.shared.Currency
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers
import org.testcontainers.postgresql.PostgreSQLContainer
import java.time.LocalDate
import java.util.UUID

@SpringBootTest(classes = [FeeTestApplication::class])
@ActiveProfiles("test")
@Testcontainers
class FeeRepositoryAdapterIT {

    companion object {
        @Container
        val postgres = PostgreSQLContainer("postgres:16").apply {
            withDatabaseName("finance_test")
            withUsername("test")
            withPassword("test")
        }

        @JvmStatic
        @DynamicPropertySource
        fun overrideDataSource(registry: DynamicPropertyRegistry) {
            registry.add("spring.datasource.url", postgres::getJdbcUrl)
            registry.add("spring.datasource.username", postgres::getUsername)
            registry.add("spring.datasource.password", postgres::getPassword)
            registry.add("spring.datasource.driver-class-name") { "org.postgresql.Driver" }
            registry.add("spring.flyway.enabled") { "true" }
            registry.add("spring.flyway.locations") { "classpath:db/migration/fees" }
            registry.add("spring.jpa.hibernate.ddl-auto") { "validate" }
            registry.add("spring.autoconfigure.exclude") {
                "org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration," +
                        "org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration"
            }
        }
    }

    @Autowired
    @Suppress("SpringJavaInjectionPointsAutowiringInspection")
    lateinit var adapter: FeeRepositoryAdapter

    private val accountId = UUID.randomUUID()

    @Test
    fun savesAndFindsById() {
        val id = UUID.randomUUID()
        adapter.save(fee(id = id, label = "Brokerage"))
        val found = adapter.findById(id)
        assertNotNull(found)
        assertEquals("Brokerage", found!!.label)
    }

    @Test
    fun returnsNullForUnknownId() {
        assertNull(adapter.findById(UUID.randomUUID()))
    }

    @Test
    fun findsFeesByAccountId() {
        val accId = UUID.randomUUID()
        adapter.save(fee(accountId = accId, label = "Fee 1"))
        adapter.save(fee(accountId = accId, label = "Fee 2"))
        val result = adapter.findByAccountId(accId, 0, 20)
        assertEquals(2, result.size)
    }

    @Test
    fun findsFeesByTransactionId() {
        val txId = UUID.randomUUID()
        adapter.save(fee(transactionId = txId, label = "Tx fee"))
        val result = adapter.findByTransactionId(txId)
        assertTrue(result.isNotEmpty())
        assertEquals("Tx fee", result.first().label)
    }

    @Test
    fun countsFeesByAccountId() {
        val accId = UUID.randomUUID()
        adapter.save(fee(accountId = accId, label = "Fee"))
        assertEquals(1L, adapter.countByAccountId(accId))
    }

    private fun fee(
        id: UUID = UUID.randomUUID(),
        accountId: UUID = this.accountId,
        transactionId: UUID? = null,
        label: String = "Test fee"
    ) = Fee(
        id = id,
        accountId = accountId,
        transactionId = transactionId,
        type = FeeType.BROKERAGE,
        amount = 199L,
        currency = Currency.EUR,
        date = LocalDate.of(2024, 1, 15),
        label = label
    )
}