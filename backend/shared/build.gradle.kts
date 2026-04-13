plugins {
    alias(libs.plugins.kotlin.multiplatform)
}

kotlin {
    explicitApi()
    jvmToolchain(21)

    jvm()

    sourceSets {
        commonMain {
            dependencies {
                // framework-free only
            }
        }
    }
}