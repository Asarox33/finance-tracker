package com.finance.app

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.runApplication
import org.springframework.data.jpa.repository.config.EnableJpaRepositories

@SpringBootApplication(scanBasePackages = ["com.finance"])
@EnableJpaRepositories(basePackages = ["com.finance"])
@EntityScan(basePackages = ["com.finance"])
class Application

fun main(args: Array<String>) {
    runApplication<Application>(*args)
}