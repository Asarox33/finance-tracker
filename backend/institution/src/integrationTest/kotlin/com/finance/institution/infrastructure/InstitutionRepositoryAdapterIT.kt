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
        val name = "SaveFind ${UUID.randomUUID()}"
        adapter.save(Institution(id, name, InstitutionType.BANK, Country.FR, "BNPAFRPP", userId))
        val found = adapter.findById(id)
        assertNotNull(found)
        assertEquals(name, found!!.name)
        assertEquals(userId, found.createdByUserId)
    }

    @Test
    fun returnsNullForUnknownId() {
        assertNull(adapter.findById(UUID.randomUUID()))
    }

    @Test
    fun listsInstitutions() {
        adapter.save(Institution(UUID.randomUUID(), "Societe Generale", InstitutionType.BANK, Country.FR, "SOGEFRPP", userId))
        val result = adapter.findAll(0, 20, name = null, country = null, type = null)
        assertTrue(result.isNotEmpty())
    }

    @Test
    fun listsInstitutionsOrderedByName() {
        val suffix = UUID.randomUUID().toString().take(8)
        val first = "SortOrder A $suffix"
        val second = "SortOrder B $suffix"
        adapter.save(Institution(UUID.randomUUID(), second, InstitutionType.BANK, Country.FR, null, userId))
        adapter.save(Institution(UUID.randomUUID(), first, InstitutionType.BANK, Country.FR, null, userId))

        val result = adapter.findAll(0, 20, name = "SortOrder", country = null, type = null)

        assertEquals(listOf(first, second), result.filter { it.name.endsWith(suffix) }.map { it.name })
    }

    @Test
    fun detectsDuplicateNameAndCountry() {
        adapter.save(Institution(UUID.randomUUID(), "Credit Agricole", InstitutionType.BANK, Country.FR, null, userId))
        assertTrue(adapter.existsByNameAndCountry("Credit Agricole", Country.FR))
    }

    @Test
    fun filtersByCountry() {
        val suffix = UUID.randomUUID().toString().take(8)
        adapter.save(Institution(UUID.randomUUID(), "Filter FR $suffix", InstitutionType.BANK, Country.FR, null, userId))
        adapter.save(Institution(UUID.randomUUID(), "Filter DE $suffix", InstitutionType.BANK, Country.DE, null, userId))
        val result = adapter.findAll(0, 20, name = null, country = Country.DE, type = null)
        assertEquals(1, result.count { it.name == "Filter DE $suffix" })
        assertTrue(adapter.count(name = null, country = Country.DE, type = null) >= 1L)
    }

    @Test
    fun filtersByNameSubstringCaseInsensitive() {
        val suffix = UUID.randomUUID().toString().take(8)
        val bnpName = "SearchBNP $suffix"
        adapter.save(Institution(UUID.randomUUID(), bnpName, InstitutionType.BANK, Country.FR, null, userId))
        adapter.save(Institution(UUID.randomUUID(), "SearchOther $suffix", InstitutionType.BANK, Country.DE, null, userId))
        val result = adapter.findAll(0, 20, name = "searchbnp", country = null, type = null)
        assertEquals(1, result.count { it.name == bnpName })
        assertTrue(adapter.count(name = "searchbnp", country = null, type = null) >= 1L)
    }

    @Test
    fun filtersByNameAndCountry() {
        val suffix = UUID.randomUUID().toString().take(8)
        val bnpFr = "ComboBNP FR $suffix"
        adapter.save(Institution(UUID.randomUUID(), bnpFr, InstitutionType.BANK, Country.FR, null, userId))
        adapter.save(Institution(UUID.randomUUID(), "ComboBNP US $suffix", InstitutionType.BANK, Country.US, null, userId))
        val result = adapter.findAll(0, 20, name = "ComboBNP", country = Country.FR, type = null)
        assertEquals(1, result.count { it.name == bnpFr })
    }
}