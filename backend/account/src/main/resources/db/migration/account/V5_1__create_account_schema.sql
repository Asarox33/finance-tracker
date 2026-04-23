CREATE SCHEMA IF NOT EXISTS account;

CREATE TABLE IF NOT EXISTS account.accounts (
 id              UUID        NOT NULL PRIMARY KEY,
 user_id         UUID        NOT NULL,
 institution_id  UUID        NOT NULL,
 name            VARCHAR(255) NOT NULL,
 type            VARCHAR(20) NOT NULL,
 currency        VARCHAR(3)  NOT NULL,
 status          VARCHAR(10) NOT NULL DEFAULT 'ACTIVE',
 created_at      TIMESTAMP   NOT NULL DEFAULT NOW()
);