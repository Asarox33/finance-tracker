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
    "account",
    "transaction",
    "fees",
    "price",
    "fx",
    "inflation",
    "analytics"
)

buildCache {
    local {
        isEnabled = true
    }
}