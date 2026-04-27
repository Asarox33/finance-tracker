CREATE SCHEMA IF NOT EXISTS price;

CREATE TABLE IF NOT EXISTS price.asset_prices (
 id                  UUID      NOT NULL PRIMARY KEY,
 asset_id            UUID      NOT NULL,
 price               BIGINT    NOT NULL,
 currency            VARCHAR(3) NOT NULL,
 date                DATE      NOT NULL,
 applied_price_date  DATE      NOT NULL,
 created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
 CONSTRAINT uq_asset_price_date UNIQUE (asset_id, date)
);

CREATE INDEX IF NOT EXISTS idx_asset_prices_asset_id_date
    ON price.asset_prices(asset_id, date DESC);