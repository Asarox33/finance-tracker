package com.finance.price.infrastructure

import com.finance.price.PriceTestApplication
import com.finance.price.domain.AssetPrice
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
import java.time.LocalDate
import java.util.UUID

@SpringBootTest(classes = [PriceTestApplication::class])
@ActiveProfiles("test")
@Testcontainers
class AssetPriceRepositoryAdapterIT {

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
            registry.add("spring.flyway.locations") { "classpath:db/migration/price" }
            registry.add("spring.jpa.hibernate.ddl-auto") { "validate" }
            registry.add("spring.autoconfigure.exclude") {
                "org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration," +
                        "org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration"
            }
        }
    }

    @Autowired
    @Suppress("SpringJavaInjectionPointsAutowiringInspection")
    lateinit var adapter: AssetPriceRepositoryAdapter

    private val assetId = UUID.randomUUID()

    @Test
    fun savesAndFindsById() {
        val id = UUID.randomUUID()
        adapter.save(price(id = id, date = LocalDate.of(2024, 1, 15)))
        val found = adapter.findById(id)
        assertNotNull(found)
        assertEquals(15000L, found!!.price)
    }

    @Test
    fun returnsNullForUnknownId() {
        assertNull(adapter.findById(UUID.randomUUID()))
    }

    @Test
    fun findsByAssetIdAndDate() {
        val date = LocalDate.of(2024, 2, 1)
        adapter.save(price(assetId = assetId, date = date))
        val found = adapter.findByAssetIdAndDate(assetId, date)
        assertNotNull(found)
        assertEquals(date, found!!.date)
    }

    @Test
    fun findsFallbackPriceWithinLookback() {
        val aid = UUID.randomUUID()
        adapter.save(price(assetId = aid, date = LocalDate.of(2024, 3, 1)))
        val found = adapter.findLatestByAssetIdOnOrBefore(aid, LocalDate.of(2024, 3, 10), 30)
        assertNotNull(found)
    }

    @Test
    fun returnsNullWhenNoPriceWithinLookback() {
        val aid = UUID.randomUUID()
        adapter.save(price(assetId = aid, date = LocalDate.of(2024, 1, 1)))
        val found = adapter.findLatestByAssetIdOnOrBefore(aid, LocalDate.of(2024, 3, 1), 5)
        assertNull(found)
    }

    private fun price(
        id: UUID = UUID.randomUUID(),
        assetId: UUID = this.assetId,
        date: LocalDate = LocalDate.of(2024, 1, 15)
    ) = AssetPrice(id, assetId, 15000L, Currency.USD, date)
}