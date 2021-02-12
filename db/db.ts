import { Pool } from "../deps.ts";
import log from "../helpers/log.ts";

const pool = new Pool({
  user: Deno.env.get("DBUSER"),
  database: Deno.env.get("DATABASE"),
  hostname: Deno.env.get("DBHOSTNAME"),
  password: Deno.env.get("DBPASSWORD"),
  port: Number(Deno.env.get("DBPORT") ?? 5432),
}, 20);

const db = await pool.connect();

export { db };
