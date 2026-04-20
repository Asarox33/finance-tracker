package com.finance.userprofile.infrastructure

import com.finance.userprofile.UserTestApplication
import com.finance.userprofile.domain.UserProfile
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers
import java.util.UUID

@SpringBootTest(classes = [UserTestApplication::class])
@ActiveProfiles("test")
@Testcontainers
class UserProfileRepositoryAdapterIT {

    companion object {
        @Container
        val postgres = PostgreSQLContainer<Nothing>("postgres:16").apply {
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
            registry.add("spring.flyway.locations") { "classpath:db/migration/user_profile" }
            registry.add("spring.jpa.hibernate.ddl-auto") { "validate" }
        }
    }

    @Autowired
    lateinit var adapter: UserProfileRepositoryAdapter

    private fun profile(
        id: UUID = UUID.randomUUID(),
        firstName: String = "John",
        lastName: String = "Doe",
        displayName: String = "johndoe",
        preferredCurrency: String = "EUR"
    ) = UserProfile(id, firstName, lastName, displayName, preferredCurrency, null)

    @Test
    fun savesAndFindsProfileById() {
        val id = UUID.randomUUID()
        adapter.save(profile(id = id))
        val found = adapter.findById(id)
        assertNotNull(found)
        assertEquals(id, found!!.id)
    }

    @Test
    fun returnsNullForUnknownId() {
        assertNull(adapter.findById(UUID.randomUUID()))
    }

    @Test
    fun updatesExistingProfile() {
        val id = UUID.randomUUID()
        adapter.save(profile(id = id, displayName = "Old Name"))
        adapter.save(profile(id = id, displayName = "New Name", preferredCurrency = "USD"))
        val found = adapter.findById(id)
        assertNotNull(found)
        assertEquals("New Name", found!!.displayName)
        assertEquals("USD", found.preferredCurrency)
    }
}