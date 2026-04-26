CREATE SCHEMA IF NOT EXISTS transaction;

CREATE TABLE IF NOT EXISTS transaction.transactions (
 id          UUID         NOT NULL PRIMARY KEY,
 account_id  UUID         NOT NULL,
 asset_id    UUID,
 type        VARCHAR(20)  NOT NULL,
 amount      BIGINT       NOT NULL,
 currency    VARCHAR(3)   NOT NULL,
 date        DATE         NOT NULL,
 label       VARCHAR(255) NOT NULL,
 notes       TEXT,
 created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transaction.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transaction.transactions(date);