CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.users (
 id                    UUID         NOT NULL PRIMARY KEY,
 email                 VARCHAR(255) NOT NULL UNIQUE,
 password_hash         VARCHAR(255) NOT NULL,
 active                BOOLEAN      NOT NULL DEFAULT TRUE,
 failed_login_attempts INT          NOT NULL DEFAULT 0,
 last_failed_login_at  TIMESTAMP    NULL,
 created_at            TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth.password_reset_tokens (
 id          UUID         NOT NULL PRIMARY KEY,
 user_id     UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 otp_hash    VARCHAR(255) NOT NULL,
 expires_at  TIMESTAMP    NOT NULL,
 used        BOOLEAN      NOT NULL DEFAULT FALSE,
 created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);