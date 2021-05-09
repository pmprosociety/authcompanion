import { Pool } from "../deps.ts";
import config from "../config.ts";

const { DBUSER, DATABASE, DBHOSTNAME, DBPASSWORD, DBPORT, DBCONNECTIONS } =
  config;

const pool = new Pool({
  user: DBUSER,
  database: DATABASE,
  hostname: DBHOSTNAME,
  password: DBPASSWORD,
  port: Number(DBPORT ?? 5432),
}, Number(DBCONNECTIONS ?? 20));

const db = await pool.connect();

export { db };
