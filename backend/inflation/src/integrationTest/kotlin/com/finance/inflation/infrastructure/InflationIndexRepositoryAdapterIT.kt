package com.finance.inflation.infrastructure

import com.finance.inflation.InflationTestApplication
import com.finance.inflation.domain.InflationIndex
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
import java.time.YearMonth
import java.util.UUID

@SpringBootTest(classes = [InflationTestApplication::class])
@ActiveProfiles("test")
@Testcontainers
class InflationIndexRepositoryAdapterIT {

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
            registry.add("spring.flyway.locations") { "classpath:db/migration/inflation" }
            registry.add("spring.jpa.hibernate.ddl-auto") { "validate" }
            registry.add("spring.autoconfigure.exclude") {
                "org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration," +
                        "org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration"
            }
        }
    }

    @Autowired
    @Suppress("SpringJavaInjectionPointsAutowiringInspection")
    lateinit var adapter: InflationIndexRepositoryAdapter

    @Test
    fun savesAndFindsById() {
        val id = UUID.randomUUID()
        adapter.save(index(id = id, currency = Currency.USD, ym = YearMonth.of(2024, 1)))
        val found = adapter.findById(id)
        assertNotNull(found)
        assertEquals(11523L, found!!.indexValue)
    }

    @Test
    fun returnsNullForUnknownId() {
        assertNull(adapter.findById(UUID.randomUUID()))
    }

    @Test
    fun findsByCurrencyAndYearMonth() {
        val ym = YearMonth.of(2024, 2)
        adapter.save(index(currency = Currency.GBP, ym = ym))
        val found = adapter.findByCurrencyAndYearMonth(Currency.GBP, ym)
        assertNotNull(found)
        assertEquals(ym, found!!.yearMonth)
    }

    @Test
    fun findsLatestOnOrBefore() {
        adapter.save(index(currency = Currency.CHF, ym = YearMonth.of(2024, 3)))
        val found = adapter.findLatestByCurrencyOnOrBefore(Currency.CHF, YearMonth.of(2024, 6))
        assertNotNull(found)
        assertEquals(YearMonth.of(2024, 3), found!!.yearMonth)
    }

    @Test
    fun returnsNullWhenNoIndexOnOrBefore() {
        val found = adapter.findLatestByCurrencyOnOrBefore(Currency.JPY, YearMonth.of(2020, 1))
        assertNull(found)
    }

    @Test
    fun findsEarliestOnOrAfter() {
        adapter.save(index(currency = Currency.CAD, ym = YearMonth.of(2024, 6)))
        val found = adapter.findEarliestByCurrencyOnOrAfter(Currency.CAD, YearMonth.of(2024, 1))
        assertNotNull(found)
        assertEquals(YearMonth.of(2024, 6), found!!.yearMonth)
    }

    private fun index(
        id: UUID = UUID.randomUUID(),
        currency: Currency = Currency.EUR,
        ym: YearMonth = YearMonth.of(2024, 1)
    ) = InflationIndex(id, currency, ym, 11523L, 2)
}