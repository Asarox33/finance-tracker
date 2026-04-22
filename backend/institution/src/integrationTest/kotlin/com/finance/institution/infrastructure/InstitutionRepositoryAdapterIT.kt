package com.finance.institution.infrastructure

import com.finance.institution.InstitutionTestApplication
import com.finance.institution.domain.Institution
import com.finance.institution.domain.InstitutionType
import com.finance.shared.Country
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

@SpringBootTest(classes = [InstitutionTestApplication::class])
@ActiveProfiles("test")
@Testcontainers
class InstitutionRepositoryAdapterIT {

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
            registry.add("spring.flyway.locations") { "classpath:db/migration/institution" }
            registry.add("spring.jpa.hibernate.ddl-auto") { "validate" }
            registry.add("spring.autoconfigure.exclude") {
                "org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration," +
                        "org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration"
            }
        }
    }

    @Autowired
    @Suppress("SpringJavaInjectionPointsAutowiringInspection")
    lateinit var adapter: InstitutionRepositoryAdapter

    private val userId = UUID.randomUUID()

    @Test
    fun savesAndFindsById() {
        val id = UUID.randomUUID()
        adapter.save(Institution(id, "BNP Paribas", InstitutionType.BANK, Country.FR, "BNPAFRPP", userId))
        val found = adapter.findById(id)
        assertNotNull(found)
        assertEquals("BNP Paribas", found!!.name)
        assertEquals(userId, found.createdByUserId)
    }

    @Test
    fun returnsNullForUnknownId() {
        assertNull(adapter.findById(UUID.randomUUID()))
    }

    @Test
    fun listsInstitutions() {
        adapter.save(Institution(UUID.randomUUID(), "Societe Generale", InstitutionType.BANK, Country.FR, "SOGEFRPP", userId))
        val result = adapter.findAll(0, 20)
        assertTrue(result.isNotEmpty())
    }

    @Test
    fun detectsDuplicateNameAndCountry() {
        adapter.save(Institution(UUID.randomUUID(), "Credit Agricole", InstitutionType.BANK, Country.FR, null, userId))
        assertTrue(adapter.existsByNameAndCountry("Credit Agricole", Country.FR))
    }
}