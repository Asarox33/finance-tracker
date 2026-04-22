package com.finance.app

import io.swagger.v3.oas.models.Components
import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.security.SecurityRequirement
import io.swagger.v3.oas.models.security.SecurityScheme
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class OpenApiConfig {

    @Bean
    fun openApi(): OpenAPI = OpenAPI()
        .info(
            Info()
                .title("Finance Tracker API")
                .version("0.0.1")
                .description("Personal finance tracking system")
        )
        .addSecurityItem(SecurityRequirement().addList("Bearer Authentication"))
        .components(
            Components().addSecuritySchemes(
                "Bearer Authentication",
                SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("Paste your JWT token obtained from POST /api/auth/login")
            )
        )
}