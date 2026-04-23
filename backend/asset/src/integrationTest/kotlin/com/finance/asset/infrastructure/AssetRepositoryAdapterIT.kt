package com.finance.asset.infrastructure

import com.finance.asset.AssetTestApplication
import com.finance.asset.domain.Asset
import com.finance.asset.domain.AssetType
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
import java.util.UUID

@SpringBootTest(classes = [AssetTestApplication::class])
@ActiveProfiles("test")
@Testcontainers
class AssetRepositoryAdapterIT {

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
            registry.add("spring.flyway.locations") { "classpath:db/migration/asset" }
            registry.add("spring.jpa.hibernate.ddl-auto") { "validate" }
            registry.add("spring.autoconfigure.exclude") {
                "org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration," +
                        "org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration"
            }
        }
    }

    @Autowired
    @Suppress("SpringJavaInjectionPointsAutowiringInspection")
    lateinit var adapter: AssetRepositoryAdapter

    private val userId = UUID.randomUUID()

    @Test
    fun savesAndFindsById() {
        val id = UUID.randomUUID()
        adapter.save(Asset(id, "Apple Inc.", AssetType.STOCK, Currency.USD, "US0378331005", "AAPL", userId))
        val found = adapter.findById(id)
        assertNotNull(found)
        assertEquals("Apple Inc.", found!!.name)
    }

    @Test
    fun returnsNullForUnknownId() {
        assertNull(adapter.findById(UUID.randomUUID()))
    }

    @Test
    fun detectsDuplicateIsin() {
        adapter.save(Asset(UUID.randomUUID(), "Microsoft", AssetType.STOCK, Currency.USD, "US5949181045", "MSFT", userId))
        assertTrue(adapter.existsByIsin("US5949181045"))
    }

    @Test
    fun listsAssets() {
        adapter.save(Asset(UUID.randomUUID(), "Amazon", AssetType.STOCK, Currency.USD, "US0231351067", "AMZN", userId))
        val result = adapter.findAll(0, 20)
        assertTrue(result.isNotEmpty())
    }
}