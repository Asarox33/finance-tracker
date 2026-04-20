package com.finance.userprofile.infrastructure

import com.finance.userprofile.domain.UserProfile
import com.finance.userprofile.domain.UserProfileRepository
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class UserProfileRepositoryAdapter(
    private val jpaRepo: JpaUserProfileSpringRepository
) : UserProfileRepository {

    override fun save(profile: UserProfile): UserProfile {
        val entity = jpaRepo.findById(profile.id).orElse(null)
            ?.also {
                it.firstName = profile.firstName
                it.lastName = profile.lastName
                it.displayName = profile.displayName
                it.preferredCurrency = profile.preferredCurrency
                it.birthDate = profile.birthDate
            }
            ?: JpaUserProfileEntity(
                id = profile.id,
                firstName = profile.firstName,
                lastName = profile.lastName,
                displayName = profile.displayName,
                preferredCurrency = profile.preferredCurrency,
                birthDate = profile.birthDate
            )
        return jpaRepo.save(entity).toDomain()
    }

    override fun findById(id: UUID): UserProfile? =
        jpaRepo.findById(id).orElse(null)?.toDomain()
}

private fun JpaUserProfileEntity.toDomain() = UserProfile(
    id = id,
    firstName = firstName,
    lastName = lastName,
    displayName = displayName,
    preferredCurrency = preferredCurrency,
    birthDate = birthDate
)