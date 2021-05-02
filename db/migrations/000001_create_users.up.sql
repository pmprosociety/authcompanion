BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE FUNCTION set_current_timestamp_updated_at() RETURNS trigger
    LANGUAGE plpgsql
AS $$
DECLARE
    _new record;
BEGIN
    _new := NEW;
    _new."updated_at" = NOW();
    RETURN _new;
END;
$$;

CREATE TABLE users (
                       id SERIAL PRIMARY KEY,
                       name text NOT NULL,
                       email text NOT NULL UNIQUE,
                       password text NOT NULL,
                       "uuid" uuid DEFAULT public.gen_random_uuid() NOT NULL,
                       refresh_token text NOT NULL,
                       active boolean NOT NULL,
                       created_at timestamp with time zone DEFAULT now() NOT NULL,
                       updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TRIGGER set_public_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_current_timestamp_updated_at();

COMMIT;
