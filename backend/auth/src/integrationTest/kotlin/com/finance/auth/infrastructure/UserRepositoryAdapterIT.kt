package com.finance.auth.infrastructure

import com.finance.auth.AuthTestApplication
import com.finance.auth.domain.User
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

@SpringBootTest(classes = [AuthTestApplication::class])
@ActiveProfiles("test")
@Testcontainers
class UserRepositoryAdapterIT {

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
            registry.add("spring.flyway.locations") { "classpath:db/migration/auth" }
            registry.add("spring.jpa.hibernate.ddl-auto") { "validate" }
        }
    }

    @Autowired
    @Suppress("SpringJavaInjectionPointsAutowiringInspection")
    lateinit var adapter: UserRepositoryAdapter

    @Test
    fun savesAndFindsUserByEmail() {
        val user = User(UUID.randomUUID(), "it_user@example.com", "hashed", true)
        adapter.save(user)
        val found = adapter.findByEmail("it_user@example.com")
        assertNotNull(found)
        assertEquals("it_user@example.com", found!!.email)
    }

    @Test
    fun returnsNullForUnknownEmail() {
        assertNull(adapter.findByEmail("nobody@example.com"))
    }

    @Test
    fun detectsExistingEmail() {
        adapter.save(User(UUID.randomUUID(), "it_user2@example.com", "hashed", true))
        assertTrue(adapter.existsByEmail("it_user2@example.com"))
    }

    @Test
    fun savesAndFindsUserById() {
        val id = UUID.randomUUID()
        adapter.save(User(id, "it_user3@example.com", "hashed", true))
        val found = adapter.findById(id)
        assertNotNull(found)
        assertEquals(id, found!!.id)
    }
}