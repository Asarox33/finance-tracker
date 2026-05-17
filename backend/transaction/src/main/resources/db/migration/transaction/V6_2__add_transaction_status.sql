ALTER TABLE transaction.transactions
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';

CREATE INDEX IF NOT EXISTS idx_transactions_account_status
    ON transaction.transactions(account_id, status);
