plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.spring)
    alias(libs.plugins.kotlin.jpa)
}

kotlin {
    jvmToolchain(25)
}

dependencies {
    implementation(project(":shared"))

    implementation(libs.spring.boot.starter.webmvc)
    implementation(libs.spring.boot.starter.data.jpa)
    implementation(libs.spring.boot.starter.validation)
    implementation(libs.spring.boot.starter.flyway)
    implementation(libs.springdoc.openapi)
    implementation(libs.postgresql)
    implementation(libs.flyway.postgresql)
    implementation(kotlin("reflect"))

    testImplementation(libs.spring.boot.starter.test.classic)
    testImplementation(libs.junit.jupiter)
    testRuntimeOnly(libs.junit.platform.launcher)

    "integrationTestImplementation"(libs.spring.boot.starter.test.classic)
    "integrationTestImplementation"(libs.junit.jupiter)
    "integrationTestImplementation"(libs.testcontainers.core)
    "integrationTestImplementation"(libs.testcontainers.postgresql)
    "integrationTestImplementation"(libs.testcontainers.junit)
    "integrationTestRuntimeOnly"(libs.junit.platform.launcher)
}