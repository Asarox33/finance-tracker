CREATE SCHEMA IF NOT EXISTS fees;

CREATE TABLE IF NOT EXISTS fees.fees (
 id              UUID        NOT NULL PRIMARY KEY,
 account_id      UUID,
 transaction_id  UUID,
 type            VARCHAR(20) NOT NULL,
 amount          BIGINT      NOT NULL,
 currency        VARCHAR(3)  NOT NULL,
 date            DATE        NOT NULL,
 label           VARCHAR(255) NOT NULL,
 created_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
 CONSTRAINT chk_fee_linked CHECK (account_id IS NOT NULL OR transaction_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_fees_account_id ON fees.fees(account_id);
CREATE INDEX IF NOT EXISTS idx_fees_transaction_id ON fees.fees(transaction_id);