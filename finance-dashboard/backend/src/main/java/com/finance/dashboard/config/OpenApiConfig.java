package com.finance.dashboard.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Finance Dashboard API")
                .description("""
                    Backend for a Finance Dashboard System with role-based access control.
                    
                    **Roles:**
                    - `VIEWER`  — dashboard summary only
                    - `ANALYST` — view records + full analytics
                    - `ADMIN`   — full access including user management
                    
                    **Auth:** Use POST /auth/login to receive a Bearer token, then click Authorize.
                    """)
                .version("1.0.0")
                .contact(new Contact().name("Finance Dashboard Team"))
                .license(new License().name("MIT")))
            .components(new Components()
                .addSecuritySchemes("bearerAuth",
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("Paste JWT token from /auth/login")));
    }
}
