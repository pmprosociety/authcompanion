import { AbstractMigration, Info } from "https://deno.land/x/nessie/mod.ts";
// import Dex from "https://deno.land/x/dex/mod.ts";

export default class ExperimentalMigration extends AbstractMigration {
  /** Runs on migrate */
  async up(info: Info): Promise<void> {
    await this.client.query(`

      CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

      CREATE FUNCTION public.set_current_timestamp_updated_at() RETURNS trigger
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


      SET default_table_access_method = heap;

      CREATE TABLE public.users (
          id integer NOT NULL,
          name text NOT NULL,
          email text NOT NULL,
          password text NOT NULL,
          "UUID" uuid DEFAULT public.gen_random_uuid() NOT NULL,
          refresh_token text NOT NULL,
          isactive boolean NOT NULL,
          created_at timestamp with time zone DEFAULT now() NOT NULL,
          updated_at timestamp with time zone DEFAULT now() NOT NULL
      );

      CREATE SEQUENCE public.users_id_seq
          AS integer
          START WITH 1
          INCREMENT BY 1
          NO MINVALUE
          NO MAXVALUE
          CACHE 1;


      ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;

      ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);

      ALTER TABLE ONLY public.users
          ADD CONSTRAINT users_email_key UNIQUE (email);

      ALTER TABLE ONLY public.users
          ADD CONSTRAINT users_pkey PRIMARY KEY (id);

      CREATE TRIGGER set_public_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
    `);
  }

  /** Runs on rollback */
  async down(info: Info): Promise<void> {
    await this.client.query(`
    
    DROP TABLE "users";

    DROP FUNCTION "set_current_timestamp_updated_at"()
    
    `);
    
  }
}
