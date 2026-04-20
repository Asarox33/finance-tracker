package com.finance.userprofile.infrastructure

import com.finance.userprofile.application.CreateUserProfile
import com.finance.userprofile.application.GetUserProfile
import com.finance.userprofile.application.UpdateUserPreferences
import com.finance.userprofile.domain.UserProfileRepository
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class UserProfileConfig {

    @Bean
    fun createUserProfile(userProfileRepository: UserProfileRepository): CreateUserProfile =
        CreateUserProfile(userProfileRepository)

    @Bean
    fun getUserProfile(userProfileRepository: UserProfileRepository): GetUserProfile =
        GetUserProfile(userProfileRepository)

    @Bean
    fun updateUserPreferences(userProfileRepository: UserProfileRepository): UpdateUserPreferences =
        UpdateUserPreferences(userProfileRepository)
}