package com.finance.fx.infrastructure

import com.finance.fx.FxTestApplication
import com.finance.fx.domain.FxRate
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

@SpringBootTest(classes = [FxTestApplication::class])
@ActiveProfiles("test")
@Testcontainers
class FxRateRepositoryAdapterIT {

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
            registry.add("spring.flyway.locations") { "classpath:db/migration/fx" }
            registry.add("spring.jpa.hibernate.ddl-auto") { "validate" }
            registry.add("spring.autoconfigure.exclude") {
                "org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration," +
                        "org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration"
            }
        }
    }

    @Autowired
    @Suppress("SpringJavaInjectionPointsAutowiringInspection")
    lateinit var adapter: FxRateRepositoryAdapter

    @Test
    fun savesAndFindsById() {
        val id = UUID.randomUUID()
        adapter.save(rate(id = id, source = Currency.USD, target = Currency.EUR, date = LocalDate.of(2024, 1, 15)))
        val found = adapter.findById(id)
        assertNotNull(found)
        assertEquals(91500L, found!!.rate)
    }

    @Test
    fun returnsNullForUnknownId() {
        assertNull(adapter.findById(UUID.randomUUID()))
    }

    @Test
    fun findsByPairAndDate() {
        val date = LocalDate.of(2024, 2, 1)
        adapter.save(rate(source = Currency.GBP, target = Currency.EUR, date = date))
        val found = adapter.findByPairAndDate(Currency.GBP, Currency.EUR, date)
        assertNotNull(found)
        assertEquals(date, found!!.date)
    }

    @Test
    fun findsFallbackWithinLookback() {
        adapter.save(rate(source = Currency.CHF, target = Currency.EUR, date = LocalDate.of(2024, 3, 1)))
        val found = adapter.findLatestByPairOnOrBefore(
            Currency.CHF, Currency.EUR, LocalDate.of(2024, 3, 10), 30
        )
        assertNotNull(found)
    }

    @Test
    fun returnsNullWhenOutsideLookback() {
        adapter.save(rate(source = Currency.JPY, target = Currency.EUR, date = LocalDate.of(2024, 1, 1)))
        val found = adapter.findLatestByPairOnOrBefore(
            Currency.JPY, Currency.EUR, LocalDate.of(2024, 3, 1), 5
        )
        assertNull(found)
    }

    @Test
    fun countsRatesByPair() {
        adapter.save(rate(source = Currency.CAD, target = Currency.EUR, date = LocalDate.of(2024, 4, 1)))
        val count = adapter.countByPair(Currency.CAD, Currency.EUR)
        assertEquals(1L, count)
    }

    private fun rate(
        id: UUID = UUID.randomUUID(),
        source: Currency = Currency.USD,
        target: Currency = Currency.EUR,
        date: LocalDate = LocalDate.of(2024, 1, 15)
    ) = FxRate(id, source, target, 91500L, 5, date)
}