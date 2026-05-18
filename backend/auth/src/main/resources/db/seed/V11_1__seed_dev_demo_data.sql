-- DEV SEED ONLY - never run in production.
-- Shared password for both seeded users: MyStrongPassword123! (BCrypt hashed).

DELETE FROM fees.fees
WHERE account_id IN (
    SELECT id
    FROM account.accounts
    WHERE user_id IN (
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'b2c3d4e5-f6a7-4901-8cde-f23456789012'
    )
)
OR transaction_id IN (
    SELECT t.id
    FROM transaction.transactions t
    JOIN account.accounts a ON a.id = t.account_id
    WHERE a.user_id IN (
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'b2c3d4e5-f6a7-4901-8cde-f23456789012'
    )
);

DELETE FROM transaction.transactions
WHERE account_id IN (
    SELECT id
    FROM account.accounts
    WHERE user_id IN (
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'b2c3d4e5-f6a7-4901-8cde-f23456789012'
    )
);

DELETE FROM account.accounts
WHERE user_id IN (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'b2c3d4e5-f6a7-4901-8cde-f23456789012'
);

DELETE FROM price.asset_prices
WHERE asset_id IN (
    SELECT id
    FROM asset.assets
    WHERE created_by_user_id IN (
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'b2c3d4e5-f6a7-4901-8cde-f23456789012'
    )
);

DELETE FROM asset.assets
WHERE created_by_user_id IN (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'b2c3d4e5-f6a7-4901-8cde-f23456789012'
);

DELETE FROM fx.fx_rates
WHERE id IN (
    '51000000-0000-4000-8000-000000000001',
    '51000000-0000-4000-8000-000000000002',
    '51000000-0000-4000-8000-000000000003',
    '51000000-0000-4000-8000-000000000004',
    '51000000-0000-4000-8000-000000000005',
    '51000000-0000-4000-8000-000000000006',
    '51000000-0000-4000-8000-000000000007',
    '51000000-0000-4000-8000-000000000008',
    '51000000-0000-4000-8000-000000000009',
    '51000000-0000-4000-8000-000000000010'
);

DELETE FROM inflation.inflation_indices
WHERE id IN (
    '52000000-0000-4000-8000-000000000001',
    '52000000-0000-4000-8000-000000000002',
    '52000000-0000-4000-8000-000000000003',
    '52000000-0000-4000-8000-000000000004',
    '52000000-0000-4000-8000-000000000005',
    '52000000-0000-4000-8000-000000000006',
    '52000000-0000-4000-8000-000000000007',
    '52000000-0000-4000-8000-000000000008'
);

DELETE FROM institution.institutions
WHERE created_by_user_id IN (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'b2c3d4e5-f6a7-4901-8cde-f23456789012'
);

DELETE FROM user_profile.user_profiles
WHERE id = 'b2c3d4e5-f6a7-4901-8cde-f23456789012'
OR id IN (
    SELECT id
    FROM auth.users
    WHERE email = 'demo@meraville.fr'
);

DELETE FROM auth.users
WHERE id = 'b2c3d4e5-f6a7-4901-8cde-f23456789012'
OR email = 'demo@meraville.fr';

INSERT INTO auth.users (id, email, password_hash, active, failed_login_attempts, last_failed_login_at, created_at)
VALUES
    (
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'github@meraville.fr',
        '$2a$10$czKyuQIpahdrd4tf86dQYOAS9kyRZGlXzgC6ue881u0OOEu5EfBEW',
        true,
        0,
        null,
        NOW()
    ),
    (
        'b2c3d4e5-f6a7-4901-8cde-f23456789012',
        'demo@meraville.fr',
        '$2a$10$czKyuQIpahdrd4tf86dQYOAS9kyRZGlXzgC6ue881u0OOEu5EfBEW',
        true,
        0,
        null,
        NOW()
    )
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    active = true,
    failed_login_attempts = 0,
    last_failed_login_at = null;

INSERT INTO user_profile.user_profiles (
    id,
    first_name,
    last_name,
    display_name,
    preferred_currency,
    birth_date,
    created_at,
    preferred_language
)
VALUES
    (
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'Merav',
        'Dev',
        'meraville',
        'EUR',
        null,
        NOW(),
        'FRA'
    ),
    (
        'b2c3d4e5-f6a7-4901-8cde-f23456789012',
        'Demo',
        'Investor',
        'demo-investor',
        'EUR',
        '1990-01-15',
        NOW(),
        'ENG'
    )
ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    display_name = EXCLUDED.display_name,
    preferred_currency = EXCLUDED.preferred_currency,
    birth_date = EXCLUDED.birth_date,
    preferred_language = EXCLUDED.preferred_language;

INSERT INTO institution.institutions (id, name, type, country, bic, created_by_user_id, created_at)
VALUES
    ('11000000-0000-4000-8000-000000000001', 'BNP Paribas', 'BANK', 'FR', 'BNPAFRPP', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW()),
    ('11000000-0000-4000-8000-000000000002', 'Interactive Brokers', 'BROKER', 'US', null, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW()),
    ('11000000-0000-4000-8000-000000000003', 'Allianz Vie', 'INSURANCE', 'DE', null, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW()),
    ('11000000-0000-4000-8000-000000000004', 'Coinbase Europe', 'CRYPTO_EXCHANGE', 'IE', null, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW()),
    ('11000000-0000-4000-8000-000000000005', 'Revolut', 'OTHER', 'GB', 'REVOGB21', 'b2c3d4e5-f6a7-4901-8cde-f23456789012', NOW()),
    ('11000000-0000-4000-8000-000000000006', 'Swissquote Bank', 'BROKER', 'CH', 'SWQBCHZZ', 'b2c3d4e5-f6a7-4901-8cde-f23456789012', NOW())
ON CONFLICT (name, country) DO UPDATE SET
    type = EXCLUDED.type,
    bic = EXCLUDED.bic,
    created_by_user_id = EXCLUDED.created_by_user_id;

INSERT INTO asset.assets (id, name, type, currency, isin, ticker, created_by_user_id, created_at)
VALUES
    ('31000000-0000-4000-8000-000000000001', 'Euro Cash Reserve', 'CASH', 'EUR', null, 'EUR-CASH', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW()),
    ('31000000-0000-4000-8000-000000000002', 'Apple Inc.', 'STOCK', 'USD', 'US0378331005', 'AAPL', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW()),
    ('31000000-0000-4000-8000-000000000003', 'US Treasury 10Y', 'BOND', 'USD', 'US91282CHP95', 'UST10Y', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW()),
    ('31000000-0000-4000-8000-000000000004', 'Vanguard S&P 500 ETF', 'ETF', 'USD', 'US9229083632', 'VOO', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW()),
    ('31000000-0000-4000-8000-000000000005', 'Euro Balanced Fund', 'MUTUAL_FUND', 'EUR', 'FR0010135103', 'EBAL', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW()),
    ('31000000-0000-4000-8000-000000000006', 'Paris Rental Unit', 'REAL_ESTATE', 'EUR', null, 'PAR-APT', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW()),
    ('31000000-0000-4000-8000-000000000007', 'Bitcoin', 'CRYPTO', 'USD', null, 'BTC', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW()),
    ('31000000-0000-4000-8000-000000000008', 'Gold Spot', 'COMMODITY', 'USD', null, 'XAU', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW()),
    ('31000000-0000-4000-8000-000000000009', 'Private Startup Note', 'OTHER', 'EUR', null, 'STARTUP-NOTE', 'b2c3d4e5-f6a7-4901-8cde-f23456789012', NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    currency = EXCLUDED.currency,
    isin = EXCLUDED.isin,
    ticker = EXCLUDED.ticker,
    created_by_user_id = EXCLUDED.created_by_user_id;

INSERT INTO account.accounts (id, user_id, institution_id, name, type, currency, status, created_at)
VALUES
    ('21000000-0000-4000-8000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11000000-0000-4000-8000-000000000001', 'Everyday Checking', 'CHECKING', 'EUR', 'ACTIVE', NOW()),
    ('21000000-0000-4000-8000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11000000-0000-4000-8000-000000000001', 'Emergency Savings', 'SAVINGS', 'EUR', 'ACTIVE', NOW()),
    ('21000000-0000-4000-8000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11000000-0000-4000-8000-000000000002', 'Global Brokerage', 'BROKERAGE', 'USD', 'ACTIVE', NOW()),
    ('21000000-0000-4000-8000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11000000-0000-4000-8000-000000000004', 'Crypto Wallet', 'CRYPTO', 'USD', 'ACTIVE', NOW()),
    ('21000000-0000-4000-8000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11000000-0000-4000-8000-000000000003', 'Rental Property', 'REAL_ESTATE', 'EUR', 'ACTIVE', NOW()),
    ('21000000-0000-4000-8000-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11000000-0000-4000-8000-000000000003', 'Retirement Plan', 'RETIREMENT', 'GBP', 'ACTIVE', NOW()),
    ('21000000-0000-4000-8000-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11000000-0000-4000-8000-000000000005', 'Travel Pocket', 'OTHER', 'CHF', 'CLOSED', NOW()),
    ('22000000-0000-4000-8000-000000000001', 'b2c3d4e5-f6a7-4901-8cde-f23456789012', '11000000-0000-4000-8000-000000000001', 'Demo Checking', 'CHECKING', 'EUR', 'ACTIVE', NOW()),
    ('22000000-0000-4000-8000-000000000002', 'b2c3d4e5-f6a7-4901-8cde-f23456789012', '11000000-0000-4000-8000-000000000002', 'Demo Brokerage', 'BROKERAGE', 'USD', 'ACTIVE', NOW()),
    ('22000000-0000-4000-8000-000000000003', 'b2c3d4e5-f6a7-4901-8cde-f23456789012', '11000000-0000-4000-8000-000000000004', 'Demo Crypto', 'CRYPTO', 'USD', 'ACTIVE', NOW())
ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    institution_id = EXCLUDED.institution_id,
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    currency = EXCLUDED.currency,
    status = EXCLUDED.status;

INSERT INTO transaction.transactions (
    id,
    account_id,
    asset_id,
    type,
    amount,
    currency,
    date,
    label,
    notes,
    applied_fx_rate,
    applied_fx_rate_scale,
    applied_fx_rate_date,
    applied_fx_source_currency,
    applied_fx_target_currency,
    created_at,
    status
)
VALUES
    ('41000000-0000-4000-8000-000000000001', '21000000-0000-4000-8000-000000000001', null, 'DEPOSIT', 420000, 'EUR', '2025-05-18', 'Opening payroll balance', 'Initial current account funding', null, null, null, null, null, NOW(), 'ACTIVE'),
    ('41000000-0000-4000-8000-000000000002', '21000000-0000-4000-8000-000000000001', null, 'DEPOSIT', 320000, 'EUR', '2026-05-01', 'Monthly salary', 'May salary', null, null, null, null, null, NOW(), 'ACTIVE'),
    ('41000000-0000-4000-8000-000000000003', '21000000-0000-4000-8000-000000000001', null, 'WITHDRAWAL', -14650, 'EUR', '2026-05-03', 'Groceries and daily spending', 'Card payments', null, null, null, null, null, NOW(), 'ACTIVE'),
    ('41000000-0000-4000-8000-000000000004', '21000000-0000-4000-8000-000000000001', null, 'TRANSFER', -80000, 'EUR', '2026-05-05', 'Transfer to savings', 'Monthly savings transfer', null, null, null, null, null, NOW(), 'ACTIVE'),
    ('41000000-0000-4000-8000-000000000005', '21000000-0000-4000-8000-000000000001', null, 'FEE', -250, 'EUR', '2026-05-08', 'Bank card fee', 'Monthly card fee', null, null, null, null, null, NOW(), 'ACTIVE'),
    ('41000000-0000-4000-8000-000000000006', '21000000-0000-4000-8000-000000000001', null, 'TAX', -12600, 'EUR', '2026-05-12', 'Income tax instalment', 'Monthly tax payment', null, null, null, null, null, NOW(), 'ACTIVE'),
    ('41000000-0000-4000-8000-000000000007', '21000000-0000-4000-8000-000000000001', null, 'OTHER', 4500, 'EUR', '2026-05-14', 'Cashback reward', 'Bank loyalty programme', null, null, null, null, null, NOW(), 'ACTIVE'),
    ('41000000-0000-4000-8000-000000000008', '21000000-0000-4000-8000-000000000002', null, 'DEPOSIT', 1200000, 'EUR', '2025-05-18', 'Emergency fund opening balance', 'Seed balance', null, null, null, null, null, NOW(), 'ACTIVE'),
    ('41000000-0000-4000-8000-000000000009', '21000000-0000-4000-8000-000000000002', null, 'TRANSFER', 80000, 'EUR', '2026-05-05', 'Transfer from checking', 'Monthly savings transfer', null, null, null, null, null, NOW(), 'ACTIVE'),
    ('41000000-0000-4000-8000-000000000010', '21000000-0000-4000-8000-000000000002', null, 'DEPOSIT', 3650, 'EUR', '2026-05-16', 'Savings interest', 'Monthly interest', null, null, null, null, null, NOW(), 'ACTIVE'),
    ('41000000-0000-4000-8000-000000000011', '21000000-0000-4000-8000-000000000003', null, 'DEPOSIT', 3500000, 'USD', '2025-05-18', 'Brokerage cash funding', 'Initial USD funding', 920000, 6, '2025-05-18', 'USD', 'EUR', NOW(), 'ACTIVE'),
    ('41000000-0000-4000-8000-000000000012', '21000000-0000-4000-8000-000000000003', '31000000-0000-4000-8000-000000000002', 'BUY', -1250000, 'USD', '2025-06-03', 'Buy Apple shares', 'Long-term position', 915000, 6, '2025-06-03', 'USD', 'EUR', NOW(), 'ACTIVE'),
    ('41000000-0000-4000-8000-000000000013', '21000000-0000-4000-8000-000000000003', '31000000-0000-4000-8000-000000000004', 'BUY', -840000, 'USD', '2025-09-12', 'Buy S&P 500 ETF', 'Core equity ETF', 930000, 6, '2025-09-12', 'USD', 'EUR', NOW(), 'ACTIVE'),
    ('41000000-0000-4000-8000-000000000014', '21000000-0000-4000-8000-000000000003', '31000000-0000-4000-8000-000000000002', 'SELL', 285000, 'USD', '2026-03-22', 'Partial Apple sale', 'Rebalance after gains', 918000, 6, '2026-03-22', 'USD', 'EUR', NOW(), 'ACTIVE'),
    ('41000000-0000-4000-8000-000000000015', '21000000-0000-4000-8000-000000000003', '31000000-0000-4000-8000-000000000002', 'DIVIDEND', 12800, 'USD', '2026-04-10', 'Apple dividend', 'Quarterly dividend', 921000, 6, '2026-04-10', 'USD', 'EUR', NOW(), 'ACTIVE'),
    ('41000000-0000-4000-8000-000000000016', '21000000-0000-4000-8000-000000000003', null, 'FEE', -1200, 'USD', '2026-04-10', 'Brokerage commission', 'Order execution fee', 921000, 6, '2026-04-10', 'USD', 'EUR', NOW(), 'ACTIVE'),
    ('41000000-0000-4000-8000-000000000017', '21000000-0000-4000-8000-000000000004', null, 'DEPOSIT', 1000000, 'USD', '2025-05-18', 'Crypto exchange funding', 'Initial crypto cash', 920000, 6, '2025-05-18', 'USD', 'EUR', NOW(), 'ACTIVE'),
    ('41000000-0000-4000-8000-000000000018', '21000000-0000-4000-8000-000000000004', '31000000-0000-4000-8000-000000000007', 'BUY', -425000, 'USD', '2025-07-08', 'Buy Bitcoin', 'Crypto allocation', 910000, 6, '2025-07-08', 'USD', 'EUR', NOW(), 'ACTIVE'),
    ('41000000-0000-4000-8000-000000000019', '21000000-0000-4000-8000-000000000004', '31000000-0000-4000-8000-000000000007', 'SELL', 112000, 'USD', '2026-02-02', 'Trim Bitcoin', 'Risk reduction', 925000, 6, '2026-02-02', 'USD', 'EUR', NOW(), 'ACTIVE'),
    ('41000000-0000-4000-8000-000000000020', '21000000-0000-4000-8000-000000000005', '31000000-0000-4000-8000-000000000006', 'DEPOSIT', 7500000, 'EUR', '2025-05-18', 'Property equity opening value', 'Rental unit equity', null, null, null, null, null, NOW(), 'ACTIVE'),
    ('41000000-0000-4000-8000-000000000021', '21000000-0000-4000-8000-000000000005', null, 'DEPOSIT', 118000, 'EUR', '2026-05-02', 'Rental income', 'Monthly rent', null, null, null, null, null, NOW(), 'ACTIVE'),
    ('41000000-0000-4000-8000-000000000022', '21000000-0000-4000-8000-000000000005', null, 'WITHDRAWAL', -31500, 'EUR', '2026-05-06', 'Property maintenance', 'Plumbing and repairs', null, null, null, null, null, NOW(), 'ACTIVE'),
    ('41000000-0000-4000-8000-000000000023', '21000000-0000-4000-8000-000000000006', null, 'DEPOSIT', 1800000, 'GBP', '2025-05-18', 'Retirement opening balance', 'Pension plan', 1160000, 6, '2025-05-18', 'GBP', 'EUR', NOW(), 'ACTIVE'),
    ('41000000-0000-4000-8000-000000000024', '21000000-0000-4000-8000-000000000006', '31000000-0000-4000-8000-000000000005', 'BUY', -250000, 'GBP', '2026-01-15', 'Buy balanced fund', 'Retirement contribution allocation', 1170000, 6, '2026-01-15', 'GBP', 'EUR', NOW(), 'ACTIVE'),
    ('41000000-0000-4000-8000-000000000025', '21000000-0000-4000-8000-000000000007', null, 'DEPOSIT', 150000, 'CHF', '2025-05-18', 'Travel pocket opening balance', 'Closed account sample', 1030000, 6, '2025-05-18', 'CHF', 'EUR', NOW(), 'ACTIVE'),
    ('41000000-0000-4000-8000-000000000026', '21000000-0000-4000-8000-000000000007', null, 'WITHDRAWAL', -120000, 'CHF', '2025-10-15', 'Travel spending', 'Card spending before closure', 1040000, 6, '2025-10-15', 'CHF', 'EUR', NOW(), 'ACTIVE'),
    ('42000000-0000-4000-8000-000000000001', '22000000-0000-4000-8000-000000000001', null, 'DEPOSIT', 250000, 'EUR', '2026-05-01', 'Demo salary', 'Demo checking activity', null, null, null, null, null, NOW(), 'ACTIVE'),
    ('42000000-0000-4000-8000-000000000002', '22000000-0000-4000-8000-000000000001', null, 'WITHDRAWAL', -4850, 'EUR', '2026-05-04', 'Demo groceries', 'Demo expense', null, null, null, null, null, NOW(), 'ACTIVE'),
    ('42000000-0000-4000-8000-000000000003', '22000000-0000-4000-8000-000000000002', null, 'DEPOSIT', 900000, 'USD', '2026-04-01', 'Demo brokerage funding', 'Demo USD funding', 921000, 6, '2026-04-01', 'USD', 'EUR', NOW(), 'ACTIVE'),
    ('42000000-0000-4000-8000-000000000004', '22000000-0000-4000-8000-000000000002', '31000000-0000-4000-8000-000000000004', 'BUY', -350000, 'USD', '2026-04-05', 'Demo ETF buy', 'Demo shared broker scenario', 921000, 6, '2026-04-05', 'USD', 'EUR', NOW(), 'ACTIVE'),
    ('42000000-0000-4000-8000-000000000005', '22000000-0000-4000-8000-000000000003', '31000000-0000-4000-8000-000000000007', 'BUY', -120000, 'USD', '2026-04-20', 'Demo Bitcoin buy', 'Demo crypto account', 922000, 6, '2026-04-20', 'USD', 'EUR', NOW(), 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET
    account_id = EXCLUDED.account_id,
    asset_id = EXCLUDED.asset_id,
    type = EXCLUDED.type,
    amount = EXCLUDED.amount,
    currency = EXCLUDED.currency,
    date = EXCLUDED.date,
    label = EXCLUDED.label,
    notes = EXCLUDED.notes,
    applied_fx_rate = EXCLUDED.applied_fx_rate,
    applied_fx_rate_scale = EXCLUDED.applied_fx_rate_scale,
    applied_fx_rate_date = EXCLUDED.applied_fx_rate_date,
    applied_fx_source_currency = EXCLUDED.applied_fx_source_currency,
    applied_fx_target_currency = EXCLUDED.applied_fx_target_currency,
    status = EXCLUDED.status;

INSERT INTO fees.fees (id, account_id, transaction_id, type, amount, currency, date, label, created_at)
VALUES
    ('43000000-0000-4000-8000-000000000001', '21000000-0000-4000-8000-000000000003', '41000000-0000-4000-8000-000000000012', 'BROKERAGE', 800, 'USD', '2025-06-03', 'Brokerage order fee', NOW()),
    ('43000000-0000-4000-8000-000000000002', '21000000-0000-4000-8000-000000000006', null, 'MANAGEMENT', 3500, 'GBP', '2026-03-31', 'Retirement management fee', NOW()),
    ('43000000-0000-4000-8000-000000000003', '21000000-0000-4000-8000-000000000003', null, 'CUSTODY', 1250, 'USD', '2026-03-31', 'Brokerage custody fee', NOW()),
    ('43000000-0000-4000-8000-000000000004', '21000000-0000-4000-8000-000000000003', '41000000-0000-4000-8000-000000000014', 'TRANSACTION', 1200, 'USD', '2026-03-22', 'Sell order transaction fee', NOW()),
    ('43000000-0000-4000-8000-000000000005', '21000000-0000-4000-8000-000000000004', null, 'SUBSCRIPTION', 999, 'USD', '2026-05-01', 'Exchange subscription fee', NOW()),
    ('43000000-0000-4000-8000-000000000006', '21000000-0000-4000-8000-000000000001', '41000000-0000-4000-8000-000000000003', 'WITHDRAWAL', 250, 'EUR', '2026-05-03', 'ATM withdrawal fee', NOW()),
    ('43000000-0000-4000-8000-000000000007', '21000000-0000-4000-8000-000000000005', null, 'OTHER', 1750, 'EUR', '2026-05-06', 'Property service fee', NOW())
ON CONFLICT (id) DO UPDATE SET
    account_id = EXCLUDED.account_id,
    transaction_id = EXCLUDED.transaction_id,
    type = EXCLUDED.type,
    amount = EXCLUDED.amount,
    currency = EXCLUDED.currency,
    date = EXCLUDED.date,
    label = EXCLUDED.label;

INSERT INTO price.asset_prices (id, asset_id, price, currency, date, applied_price_date, created_at)
VALUES
    ('32000000-0000-4000-8000-000000000001', '31000000-0000-4000-8000-000000000001', 100, 'EUR', '2026-05-18', '2026-05-18', NOW()),
    ('32000000-0000-4000-8000-000000000002', '31000000-0000-4000-8000-000000000002', 18250, 'USD', '2025-05-18', '2025-05-18', NOW()),
    ('32000000-0000-4000-8000-000000000003', '31000000-0000-4000-8000-000000000002', 19140, 'USD', '2026-05-18', '2026-05-18', NOW()),
    ('32000000-0000-4000-8000-000000000004', '31000000-0000-4000-8000-000000000003', 9950, 'USD', '2025-05-18', '2025-05-18', NOW()),
    ('32000000-0000-4000-8000-000000000005', '31000000-0000-4000-8000-000000000003', 10120, 'USD', '2026-05-18', '2026-05-18', NOW()),
    ('32000000-0000-4000-8000-000000000006', '31000000-0000-4000-8000-000000000004', 48620, 'USD', '2025-05-18', '2025-05-18', NOW()),
    ('32000000-0000-4000-8000-000000000007', '31000000-0000-4000-8000-000000000004', 53480, 'USD', '2026-05-18', '2026-05-18', NOW()),
    ('32000000-0000-4000-8000-000000000008', '31000000-0000-4000-8000-000000000005', 12450, 'EUR', '2025-05-18', '2025-05-18', NOW()),
    ('32000000-0000-4000-8000-000000000009', '31000000-0000-4000-8000-000000000005', 13120, 'EUR', '2026-05-18', '2026-05-18', NOW()),
    ('32000000-0000-4000-8000-000000000010', '31000000-0000-4000-8000-000000000006', 7500000, 'EUR', '2025-05-18', '2025-05-18', NOW()),
    ('32000000-0000-4000-8000-000000000011', '31000000-0000-4000-8000-000000000006', 7820000, 'EUR', '2026-05-18', '2026-05-18', NOW()),
    ('32000000-0000-4000-8000-000000000012', '31000000-0000-4000-8000-000000000007', 6720000, 'USD', '2025-05-18', '2025-05-18', NOW()),
    ('32000000-0000-4000-8000-000000000013', '31000000-0000-4000-8000-000000000007', 10450000, 'USD', '2026-05-18', '2026-05-18', NOW()),
    ('32000000-0000-4000-8000-000000000014', '31000000-0000-4000-8000-000000000008', 238500, 'USD', '2025-05-18', '2025-05-18', NOW()),
    ('32000000-0000-4000-8000-000000000015', '31000000-0000-4000-8000-000000000008', 315000, 'USD', '2026-05-18', '2026-05-18', NOW()),
    ('32000000-0000-4000-8000-000000000016', '31000000-0000-4000-8000-000000000009', 100000, 'EUR', '2026-05-18', '2026-05-18', NOW())
ON CONFLICT (asset_id, date) DO UPDATE SET
    price = EXCLUDED.price,
    currency = EXCLUDED.currency,
    applied_price_date = EXCLUDED.applied_price_date;

INSERT INTO fx.fx_rates (id, source_currency, target_currency, rate, rate_scale, date, applied_rate_date, created_at)
VALUES
    ('51000000-0000-4000-8000-000000000001', 'USD', 'EUR', 920000, 6, '2025-05-18', '2025-05-18', NOW()),
    ('51000000-0000-4000-8000-000000000002', 'USD', 'EUR', 915000, 6, '2025-06-03', '2025-06-03', NOW()),
    ('51000000-0000-4000-8000-000000000003', 'USD', 'EUR', 930000, 6, '2025-09-12', '2025-09-12', NOW()),
    ('51000000-0000-4000-8000-000000000004', 'USD', 'EUR', 918000, 6, '2026-03-22', '2026-03-22', NOW()),
    ('51000000-0000-4000-8000-000000000005', 'USD', 'EUR', 921000, 6, '2026-04-10', '2026-04-10', NOW()),
    ('51000000-0000-4000-8000-000000000006', 'USD', 'EUR', 922000, 6, '2026-04-20', '2026-04-20', NOW()),
    ('51000000-0000-4000-8000-000000000007', 'USD', 'EUR', 925000, 6, '2026-05-18', '2026-05-18', NOW()),
    ('51000000-0000-4000-8000-000000000008', 'GBP', 'EUR', 1160000, 6, '2025-05-18', '2025-05-18', NOW()),
    ('51000000-0000-4000-8000-000000000009', 'GBP', 'EUR', 1170000, 6, '2026-05-18', '2026-05-18', NOW()),
    ('51000000-0000-4000-8000-000000000010', 'CHF', 'EUR', 1030000, 6, '2026-05-18', '2026-05-18', NOW())
ON CONFLICT (source_currency, target_currency, date) DO UPDATE SET
    rate = EXCLUDED.rate,
    rate_scale = EXCLUDED.rate_scale,
    applied_rate_date = EXCLUDED.applied_rate_date;

INSERT INTO inflation.inflation_indices (id, currency, year_month, index_value, index_scale, created_at)
VALUES
    ('52000000-0000-4000-8000-000000000001', 'EUR', '2025-05', 100000, 3, NOW()),
    ('52000000-0000-4000-8000-000000000002', 'EUR', '2025-11', 101300, 3, NOW()),
    ('52000000-0000-4000-8000-000000000003', 'EUR', '2026-05', 102600, 3, NOW()),
    ('52000000-0000-4000-8000-000000000004', 'USD', '2025-05', 100000, 3, NOW()),
    ('52000000-0000-4000-8000-000000000005', 'USD', '2026-05', 103100, 3, NOW()),
    ('52000000-0000-4000-8000-000000000006', 'GBP', '2025-05', 100000, 3, NOW()),
    ('52000000-0000-4000-8000-000000000007', 'GBP', '2026-05', 103800, 3, NOW()),
    ('52000000-0000-4000-8000-000000000008', 'CHF', '2026-05', 100900, 3, NOW())
ON CONFLICT (currency, year_month) DO UPDATE SET
    index_value = EXCLUDED.index_value,
    index_scale = EXCLUDED.index_scale;
