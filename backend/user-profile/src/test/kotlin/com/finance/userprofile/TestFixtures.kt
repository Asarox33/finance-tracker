package com.finance.userprofile

import com.finance.shared.Currency
import com.finance.userprofile.domain.UserProfile
import com.finance.userprofile.domain.UserProfileRepository
import java.util.UUID

class InMemoryUserProfileRepository : UserProfileRepository {
    private val store = mutableMapOf<UUID, UserProfile>()
    override fun save(profile: UserProfile): UserProfile { store[profile.id] = profile; return profile }
    override fun findById(id: UUID): UserProfile? = store[id]
}

fun testProfile(
    id: UUID = UUID.randomUUID(),
    firstName: String = "John",
    lastName: String = "Doe",
    displayName: String = "johndoe",
    preferredCurrency: Currency = Currency.EUR
) = UserProfile(id, firstName, lastName, displayName, preferredCurrency, null)