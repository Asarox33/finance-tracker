CREATE SCHEMA IF NOT EXISTS fx;

CREATE TABLE IF NOT EXISTS fx.fx_rates (
 id                  UUID      NOT NULL PRIMARY KEY,
 source_currency     VARCHAR(3) NOT NULL,
 target_currency     VARCHAR(3) NOT NULL,
 rate                BIGINT    NOT NULL,
 rate_scale          INT       NOT NULL,
 date                DATE      NOT NULL,
 applied_rate_date   DATE      NOT NULL,
 created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
 CONSTRAINT uq_fx_rate_pair_date UNIQUE (source_currency, target_currency, date)
);

CREATE INDEX IF NOT EXISTS idx_fx_rates_pair_date
    ON fx.fx_rates(source_currency, target_currency, date DESC);