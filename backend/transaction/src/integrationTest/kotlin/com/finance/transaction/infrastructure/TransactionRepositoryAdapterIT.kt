package com.finance.transaction.infrastructure

import com.finance.shared.Currency
import com.finance.transaction.TransactionTestApplication
import com.finance.transaction.domain.Transaction
import com.finance.transaction.domain.TransactionType
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
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

@SpringBootTest(classes = [TransactionTestApplication::class])
@ActiveProfiles("test")
@Testcontainers
class TransactionRepositoryAdapterIT {

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
            registry.add("spring.flyway.locations") { "classpath:db/migration/transaction" }
            registry.add("spring.jpa.hibernate.ddl-auto") { "validate" }
            registry.add("spring.autoconfigure.exclude") {
                "org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration," +
                        "org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration"
            }
        }
    }

    @Autowired
    @Suppress("SpringJavaInjectionPointsAutowiringInspection")
    lateinit var adapter: TransactionRepositoryAdapter

    private val accountId = UUID.randomUUID()

    @Test
    fun savesAndFindsById() {
        val id = UUID.randomUUID()
        adapter.save(tx(id = id, label = "Salary"))
        val found = adapter.findById(id)
        assertNotNull(found)
        assertEquals("Salary", found!!.label)
    }

    @Test
    fun returnsNullForUnknownId() {
        assertNull(adapter.findById(UUID.randomUUID()))
    }

    @Test
    fun findsTransactionsByAccountId() {
        val accId = UUID.randomUUID()
        adapter.save(tx(accountId = accId, label = "T1"))
        adapter.save(tx(accountId = accId, label = "T2"))
        val result = adapter.findByAccountId(accId, 0, 20)
        assertEquals(2, result.size)
    }

    @Test
    fun filtersTransactionsByDateRange() {
        val accId = UUID.randomUUID()
        adapter.save(tx(accountId = accId, date = LocalDate.of(2024, 1, 10), label = "Jan"))
        adapter.save(tx(accountId = accId, date = LocalDate.of(2024, 3, 10), label = "Mar"))
        val result = adapter.findByAccountIdAndDateBetween(
            accId, LocalDate.of(2024, 1, 1), LocalDate.of(2024, 2, 28), 0, 20
        )
        assertEquals(1, result.size)
        assertEquals("Jan", result.first().label)
    }

    @Test
    fun countsTransactionsByAccountId() {
        val accId = UUID.randomUUID()
        adapter.save(tx(accountId = accId, label = "T1"))
        adapter.save(tx(accountId = accId, label = "T2"))
        assertEquals(2L, adapter.countByAccountId(accId))
    }

    private fun tx(
        id: UUID = UUID.randomUUID(),
        accountId: UUID = this.accountId,
        date: LocalDate = LocalDate.of(2024, 1, 15),
        label: String = "Test transaction"
    ) = Transaction(
        id = id,
        accountId = accountId,
        assetId = null,
        type = TransactionType.DEPOSIT,
        amount = 10000L,
        currency = Currency.EUR,
        date = date,
        label = label,
        notes = null
    )
}