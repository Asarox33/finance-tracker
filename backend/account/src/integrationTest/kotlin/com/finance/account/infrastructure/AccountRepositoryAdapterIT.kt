package com.finance.account.infrastructure

import com.finance.account.AccountTestApplication
import com.finance.account.domain.Account
import com.finance.account.domain.AccountStatus
import com.finance.account.domain.AccountType
import com.finance.shared.Currency
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
import java.util.UUID

@SpringBootTest(classes = [AccountTestApplication::class])
@ActiveProfiles("test")
@Testcontainers
class AccountRepositoryAdapterIT {

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
            registry.add("spring.flyway.locations") { "classpath:db/migration/account" }
            registry.add("spring.jpa.hibernate.ddl-auto") { "validate" }
            registry.add("spring.autoconfigure.exclude") {
                "org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration," +
                        "org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration"
            }
        }
    }

    @Autowired
    @Suppress("SpringJavaInjectionPointsAutowiringInspection")
    lateinit var adapter: AccountRepositoryAdapter

    private val userId = UUID.randomUUID()
    private val institutionId = UUID.randomUUID()

    @Test
    fun savesAndFindsById() {
        val id = UUID.randomUUID()
        adapter.save(Account(id, userId, institutionId, "My Account", AccountType.CHECKING, Currency.EUR, AccountStatus.ACTIVE))
        val found = adapter.findById(id)
        assertNotNull(found)
        assertEquals("My Account", found!!.name)
    }

    @Test
    fun returnsNullForUnknownId() {
        assertNull(adapter.findById(UUID.randomUUID()))
    }

    @Test
    fun findsAccountsByUserId() {
        val uid = UUID.randomUUID()
        adapter.save(Account(UUID.randomUUID(), uid, institutionId, "Account 1", AccountType.SAVINGS, Currency.EUR, AccountStatus.ACTIVE))
        adapter.save(Account(UUID.randomUUID(), uid, institutionId, "Account 2", AccountType.CHECKING, Currency.EUR, AccountStatus.ACTIVE))
        val result = adapter.findByUserId(uid, 0, 20, type = null)
        assertEquals(2, result.size)
    }

    @Test
    fun findsAccountsByUserIdOrderedByName() {
        val uid = UUID.randomUUID()
        val suffix = UUID.randomUUID().toString().take(8)
        val first = "SortAccount A $suffix"
        val second = "SortAccount B $suffix"
        adapter.save(Account(UUID.randomUUID(), uid, institutionId, second, AccountType.SAVINGS, Currency.EUR, AccountStatus.ACTIVE))
        adapter.save(Account(UUID.randomUUID(), uid, institutionId, first, AccountType.CHECKING, Currency.EUR, AccountStatus.ACTIVE))

        val result = adapter.findByUserId(uid, 0, 20, type = null)

        assertEquals(listOf(first, second), result.map { it.name })
    }

    @Test
    fun countsAccountsByUserId() {
        val uid = UUID.randomUUID()
        adapter.save(Account(UUID.randomUUID(), uid, institutionId, "Account", AccountType.CHECKING, Currency.EUR, AccountStatus.ACTIVE))
        assertEquals(1L, adapter.countByUserId(uid, type = null))
    }

    @Test
    fun updatesAccountStatus() {
        val id = UUID.randomUUID()
        adapter.save(Account(id, userId, institutionId, "My Account", AccountType.CHECKING, Currency.EUR, AccountStatus.ACTIVE))
        adapter.save(Account(id, userId, institutionId, "My Account", AccountType.CHECKING, Currency.EUR, AccountStatus.CLOSED))
        val found = adapter.findById(id)
        assertEquals(AccountStatus.CLOSED, found!!.status)
    }
}