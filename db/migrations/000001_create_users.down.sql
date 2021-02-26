BEGIN;
DROP FUNCTION set_current_timestamp_updated_at;

DROP TABLE users;

DROP TRIGGER set_public_users_updated_at;
COMMIT;
