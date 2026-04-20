CREATE SCHEMA IF NOT EXISTS user_profile;

CREATE TABLE IF NOT EXISTS user_profile.user_profiles (
    id                  UUID         NOT NULL PRIMARY KEY,
    first_name          VARCHAR(255) NOT NULL DEFAULT '',
    last_name           VARCHAR(255) NOT NULL DEFAULT '',
    display_name        VARCHAR(255) NOT NULL DEFAULT '',
    preferred_currency  VARCHAR(3)   NOT NULL,
    birth_date          DATE,
    created_at          TIMESTAMP    NOT NULL DEFAULT NOW()
);