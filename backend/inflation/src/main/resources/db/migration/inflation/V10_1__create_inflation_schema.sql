CREATE SCHEMA IF NOT EXISTS inflation;

CREATE TABLE IF NOT EXISTS inflation.inflation_indices (
 id          UUID        NOT NULL PRIMARY KEY,
 currency    VARCHAR(3)  NOT NULL,
 year_month  VARCHAR(7)  NOT NULL,
 index_value BIGINT      NOT NULL,
 index_scale INT         NOT NULL,
 created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
 CONSTRAINT uq_inflation_currency_month UNIQUE (currency, year_month)
);

CREATE INDEX IF NOT EXISTS idx_inflation_currency_month
    ON inflation.inflation_indices(currency, year_month DESC);