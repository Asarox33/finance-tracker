CREATE SCHEMA IF NOT EXISTS transaction;

CREATE TABLE IF NOT EXISTS transaction.transactions (
 id                          UUID         NOT NULL PRIMARY KEY,
 account_id                  UUID         NOT NULL,
 asset_id                    UUID,
 type                        VARCHAR(20)  NOT NULL,
 amount                      BIGINT       NOT NULL,
 currency                    VARCHAR(3)   NOT NULL,
 date                        DATE         NOT NULL,
 label                       VARCHAR(255) NOT NULL,
 notes                       TEXT,
 applied_fx_rate             BIGINT,
 applied_fx_rate_scale       INT,
 applied_fx_rate_date        DATE,
 applied_fx_source_currency  VARCHAR(3),
 applied_fx_target_currency  VARCHAR(3),
 created_at                  TIMESTAMP    NOT NULL DEFAULT NOW(),
 CONSTRAINT chk_fx_fields CHECK (
     (applied_fx_rate IS NULL AND applied_fx_rate_scale IS NULL AND applied_fx_rate_date IS NULL
         AND applied_fx_source_currency IS NULL AND applied_fx_target_currency IS NULL)
         OR
     (applied_fx_rate IS NOT NULL AND applied_fx_rate_scale IS NOT NULL AND applied_fx_rate_date IS NOT NULL
         AND applied_fx_source_currency IS NOT NULL AND applied_fx_target_currency IS NOT NULL)
     )
);

CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transaction.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transaction.transactions(date);