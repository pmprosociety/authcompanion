import {
  ClientOptions,
  ClientPostgreSQL,
} from "https://deno.land/x/nessie/mod.ts";
import { DATABASE, DBHOSTNAME, DBPASSWORD, DBPORT, DBUSER } from "./config.ts";

/** These are the default config options. */
const nessieOptions: ClientOptions = {
  migrationFolder: "./db/migrations",
  seedFolder: "./db/seeds",
  experimental: true,
};

/** Select one of the supported clients */
const clientPg = new ClientPostgreSQL(nessieOptions, {
  database: DATABASE,
  hostname: DBHOSTNAME,
  port: Number(DBPORT),
  user: DBUSER,
  password: DBPASSWORD,
});

/** This is the final config object */
const config = {
  client: clientPg,
  // Defaults to false, if you want the query builder exposed in migration files, set this to true.
  exposeQueryBuilder: false,
};

export default config;
