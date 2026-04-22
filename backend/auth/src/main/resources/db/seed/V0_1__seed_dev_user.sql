-- DEV SEED ONLY — never run in production
-- Password: MyStrongPassword123! (BCrypt hashed)
INSERT INTO auth.users (id, email, password_hash, active, failed_login_attempts, last_failed_login_at, created_at)
VALUES (
           'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
           'github@meraville.fr',
           '$2a$10$czKyuQIpahdrd4tf86dQYOAS9kyRZGlXzgC6ue881u0OOEu5EfBEW',
           true,
           0,
           null,
           NOW()
       )
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_profile.user_profiles (id, first_name, last_name, display_name, preferred_currency, birth_date, created_at)
VALUES (
           'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
           'Merav',
           'Dev',
           'meraville',
           'EUR',
           null,
           NOW()
       )
ON CONFLICT (id) DO NOTHING;