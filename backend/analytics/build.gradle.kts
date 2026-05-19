plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.spring)
}

kotlin {
    jvmToolchain(25)
}

dependencies {
    implementation(project(":shared"))
    implementation(project(":account"))
    implementation(project(":institution"))
    implementation(project(":transaction"))
    implementation(project(":fees"))
    implementation(project(":price"))
    implementation(project(":fx"))
    implementation(project(":inflation"))

    implementation(libs.spring.boot.starter.webmvc)
    implementation(libs.spring.boot.starter.security)
    implementation(libs.springdoc.openapi)
    implementation(kotlin("reflect"))

    testImplementation(libs.spring.boot.starter.test.classic)
    testImplementation(libs.junit.jupiter)
    testRuntimeOnly(libs.junit.platform.launcher)
}