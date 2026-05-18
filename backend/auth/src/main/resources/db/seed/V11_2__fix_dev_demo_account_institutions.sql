-- DEV SEED ONLY - fixes account links when shared institutions already existed with different UUIDs.

UPDATE account.accounts
SET institution_id = (SELECT id FROM institution.institutions WHERE name = 'BNP Paribas' AND country = 'FR')
WHERE id IN (
    '21000000-0000-4000-8000-000000000001',
    '21000000-0000-4000-8000-000000000002',
    '22000000-0000-4000-8000-000000000001'
);

UPDATE account.accounts
SET institution_id = (SELECT id FROM institution.institutions WHERE name = 'Interactive Brokers' AND country = 'US')
WHERE id IN (
    '21000000-0000-4000-8000-000000000003',
    '22000000-0000-4000-8000-000000000002'
);

UPDATE account.accounts
SET institution_id = (SELECT id FROM institution.institutions WHERE name = 'Coinbase Europe' AND country = 'IE')
WHERE id IN (
    '21000000-0000-4000-8000-000000000004',
    '22000000-0000-4000-8000-000000000003'
);

UPDATE account.accounts
SET institution_id = (SELECT id FROM institution.institutions WHERE name = 'Allianz Vie' AND country = 'DE')
WHERE id IN (
    '21000000-0000-4000-8000-000000000005',
    '21000000-0000-4000-8000-000000000006'
);

UPDATE account.accounts
SET institution_id = (SELECT id FROM institution.institutions WHERE name = 'Revolut' AND country = 'GB')
WHERE id = '21000000-0000-4000-8000-000000000007';
