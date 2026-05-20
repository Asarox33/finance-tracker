ALTER TABLE transaction.transactions
    ADD COLUMN IF NOT EXISTS asset_quantity_minor BIGINT,
    ADD COLUMN IF NOT EXISTS asset_quantity_scale INT;

ALTER TABLE transaction.transactions
    ADD CONSTRAINT chk_transaction_asset_quantity_fields CHECK (
        (asset_quantity_minor IS NULL AND asset_quantity_scale IS NULL)
        OR (
            asset_quantity_minor IS NOT NULL
            AND asset_quantity_scale IS NOT NULL
            AND asset_quantity_minor > 0
            AND asset_quantity_scale >= 0
            AND asset_quantity_scale <= 18
        )
    );
