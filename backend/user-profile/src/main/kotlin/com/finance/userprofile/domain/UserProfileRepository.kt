package com.finance.userprofile.domain

import java.util.UUID

interface UserProfileRepository {
    fun save(profile: UserProfile): UserProfile
    fun findById(id: UUID): UserProfile?
}