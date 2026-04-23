CREATE SCHEMA IF NOT EXISTS asset;

CREATE TABLE IF NOT EXISTS asset.assets (
 id                  UUID         NOT NULL PRIMARY KEY,
 name                VARCHAR(255) NOT NULL,
 type                VARCHAR(20)  NOT NULL,
 currency            VARCHAR(3)   NOT NULL,
 isin                VARCHAR(12)  UNIQUE,
 ticker              VARCHAR(20),
 created_by_user_id  UUID         NOT NULL,
 created_at          TIMESTAMP    NOT NULL DEFAULT NOW()
);