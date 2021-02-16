import { Pool } from "../deps.ts";
import log from "../helpers/log.ts";
import {
  DATABASE,
  DBCONNECTIONS,
  DBHOSTNAME,
  DBPASSWORD,
  DBPORT,
  DBUSER,
} from "../config.ts";

const pool = new Pool({
  user: DBUSER,
  database: DATABASE,
  hostname: DBHOSTNAME,
  password: DBPASSWORD,
  port: Number(DBPORT ?? 5432),
}, Number(DBCONNECTIONS ?? 20));

const db = await pool.connect();

export { db };
