package com.finance.institution

import com.finance.institution.infrastructure.InstitutionRepositoryAdapter
import com.finance.institution.infrastructure.JpaInstitutionSpringRepository
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.persistence.autoconfigure.EntityScan
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.jpa.repository.config.EnableJpaRepositories

@Configuration
@EnableAutoConfiguration
@EnableJpaRepositories(basePackages = ["com.finance.institution.infrastructure"])
@EntityScan(basePackages = ["com.finance.institution.infrastructure"])
class InstitutionTestApplication {

    @Bean
    fun institutionRepositoryAdapter(
        jpaRepo: JpaInstitutionSpringRepository
    ): InstitutionRepositoryAdapter = InstitutionRepositoryAdapter(jpaRepo)
}