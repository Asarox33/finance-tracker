package com.finance.fees.infrastructure

import com.finance.fees.application.GetFee
import com.finance.fees.application.ListFees
import com.finance.fees.application.RecordFee
import com.finance.fees.domain.FeeRepository
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class FeeConfig {

    @Bean
    fun recordFee(feeRepository: FeeRepository): RecordFee =
        RecordFee(feeRepository)

    @Bean
    fun getFee(feeRepository: FeeRepository): GetFee =
        GetFee(feeRepository)

    @Bean
    fun listFees(feeRepository: FeeRepository): ListFees =
        ListFees(feeRepository)
}