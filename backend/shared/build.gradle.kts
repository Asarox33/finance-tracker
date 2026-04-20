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
        val jvmTest by getting {
            dependencies {
                implementation(libs.junit.jupiter)
                runtimeOnly(libs.junit.platform.launcher)
            }
        }
    }
}