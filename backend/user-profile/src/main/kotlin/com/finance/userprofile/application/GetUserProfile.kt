package com.finance.userprofile.application

import com.finance.shared.error.NotFoundException
import com.finance.userprofile.domain.UserProfile
import com.finance.userprofile.domain.UserProfileRepository
import java.util.UUID

class GetUserProfile(
    private val userProfileRepository: UserProfileRepository
) {
    fun execute(userId: UUID): UserProfile =
        userProfileRepository.findById(userId)
            ?: throw NotFoundException("User profile not found: $userId")
}