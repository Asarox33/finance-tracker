plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "1.0.0"
}

rootProject.name = "finance-tracker"

include(
    "app",
    "shared",
    "auth",
    "user-profile",
    "institution",
    "asset",
    "account"
)

buildCache {
    local {
        isEnabled = true
    }
}