
CREATE USER profiles ENCRYPTED PASSWORD '@CHANGE-TO-SECURE-PASSWORD@';

CREATE database profiles;
\connect profiles;

CREATE SCHEMA IF NOT EXISTS profile;

CREATE TABLE IF NOT EXISTS profile.key_value (
  profile_key TEXT NOT NULL,
  profile_value TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  modified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY(profile_key)
);

GRANT CONNECT ON database profiles TO profiles;
GRANT USAGE ON SCHEMA profile TO profiles;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA profile TO profiles;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA profile TO profiles;