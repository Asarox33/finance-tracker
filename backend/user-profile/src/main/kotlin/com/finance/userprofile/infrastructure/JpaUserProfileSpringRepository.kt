package com.finance.userprofile.infrastructure

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface JpaUserProfileSpringRepository : JpaRepository<JpaUserProfileEntity, UUID>