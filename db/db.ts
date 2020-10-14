import { Client } from "../deps.ts";
import { config } from "../deps.ts";

const env = config();

const db = new Client({
  user: env.USER,
  database: env.DATABASE,
  hostname: env.HOSTNAME,
  password: env.PASSWORD,
  port: +env.DBPORT,
});

export { db };
