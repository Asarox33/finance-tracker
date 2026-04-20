plugins {
    alias(libs.plugins.kotlin.jvm) apply false
    alias(libs.plugins.kotlin.multiplatform) apply false
    alias(libs.plugins.kotlin.serialization) apply false
    alias(libs.plugins.kotlin.spring) apply false
    alias(libs.plugins.kotlin.jpa) apply false
    alias(libs.plugins.spring.boot) apply false
}

allprojects {
    group = "com.finance"
    version = "0.0.1-SNAPSHOT"

    repositories {
        mavenCentral()
    }
}

val skipIT: Boolean = findProperty("skipIT")?.toString()?.toBoolean() ?: false

subprojects {
    dependencyLocking {
        lockAllConfigurations()
    }

    tasks.withType<Test> {
        useJUnitPlatform()
    }

    plugins.withId("org.jetbrains.kotlin.jvm") {
        val sourceSets = extensions.getByType<SourceSetContainer>()

        val integrationTest by sourceSets.creating {
            compileClasspath += sourceSets.getByName("main").output +
                    sourceSets.getByName("test").output
            runtimeClasspath += sourceSets.getByName("main").output +
                    sourceSets.getByName("test").output
        }

        configurations[integrationTest.implementationConfigurationName]
            .extendsFrom(configurations.getByName("testImplementation"))
        configurations[integrationTest.runtimeOnlyConfigurationName]
            .extendsFrom(configurations.getByName("testRuntimeOnly"))

        tasks.named<Test>("test") {
            include("**/*Test.class")
            exclude("**/*IT.class")
        }

        val integrationTestTask = tasks.register<Test>("integrationTest") {
            description = "Runs integration tests (requires Docker/Testcontainers)."
            group = "verification"
            useJUnitPlatform()
            testClassesDirs = integrationTest.output.classesDirs
            classpath = integrationTest.runtimeClasspath
            include("**/*IT.class")
            shouldRunAfter(tasks.named("test"))
            onlyIf { !skipIT }
        }

        tasks.named("check") {
            dependsOn(integrationTestTask)
        }

        extensions.configure<org.jetbrains.kotlin.gradle.dsl.KotlinJvmProjectExtension> {
            jvmToolchain(25)
        }
    }
}