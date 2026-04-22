package com.finance.institution.infrastructure

import com.finance.institution.application.CreateInstitution
import com.finance.institution.application.GetInstitution
import com.finance.institution.application.ListInstitutions
import com.finance.institution.domain.InstitutionRepository
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class InstitutionConfig {

    @Bean
    fun createInstitution(institutionRepository: InstitutionRepository): CreateInstitution =
        CreateInstitution(institutionRepository)

    @Bean
    fun getInstitution(institutionRepository: InstitutionRepository): GetInstitution =
        GetInstitution(institutionRepository)

    @Bean
    fun listInstitutions(institutionRepository: InstitutionRepository): ListInstitutions =
        ListInstitutions(institutionRepository)
}