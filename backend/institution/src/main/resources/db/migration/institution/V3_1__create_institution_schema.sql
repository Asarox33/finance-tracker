CREATE SCHEMA IF NOT EXISTS institution;

CREATE TABLE IF NOT EXISTS institution.institutions (
 id                  UUID         NOT NULL PRIMARY KEY,
 name                VARCHAR(255) NOT NULL,
 type                VARCHAR(20)  NOT NULL,
 country             VARCHAR(2)   NOT NULL,
 bic                 VARCHAR(11),
 created_by_user_id  UUID         NOT NULL,
 created_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
 CONSTRAINT uq_institution_name_country UNIQUE (name, country)
);