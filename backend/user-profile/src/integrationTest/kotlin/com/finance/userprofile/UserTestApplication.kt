package com.finance.userprofile

import com.finance.userprofile.infrastructure.JpaUserProfileSpringRepository
import com.finance.userprofile.infrastructure.UserProfileRepositoryAdapter
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.persistence.autoconfigure.EntityScan
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.jpa.repository.config.EnableJpaRepositories

@Configuration
@EnableAutoConfiguration
@EnableJpaRepositories(basePackages = ["com.finance.userprofile.infrastructure"])
@EntityScan(basePackages = ["com.finance.userprofile.infrastructure"])
class UserTestApplication {

    @Bean
    fun userProfileRepositoryAdapter(
        jpaRepo: JpaUserProfileSpringRepository
    ): UserProfileRepositoryAdapter = UserProfileRepositoryAdapter(jpaRepo)
}