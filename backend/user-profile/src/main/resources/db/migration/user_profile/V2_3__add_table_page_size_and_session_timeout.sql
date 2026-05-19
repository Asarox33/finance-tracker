ALTER TABLE user_profile.user_profiles
    ADD COLUMN table_page_size INT NOT NULL DEFAULT 20,
    ADD COLUMN session_timeout_minutes INT NOT NULL DEFAULT 10;
