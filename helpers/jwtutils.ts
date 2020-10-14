import { Jose, makeJwt, Payload, setExpiration } from "../deps.ts";
import { validateJwt } from "../deps.ts";
import { config } from "../deps.ts";
import { v4 } from "../deps.ts";

import { db } from "../db/db.ts";

const env = config();

export async function makeAccesstoken(result: any) {
  var date = new Date();
  date.setHours(date.getHours() + 4);

  const key = env.ACCESSTOKENKEY;

  const objectRows = result.rowsOfObjects();
  const user = objectRows[0];

  const header: Jose = { alg: "HS256", typ: "JWT" };
  const payload: Payload = {
    name: user.name,
    email: user.email,
    exp: setExpiration(date),
  };

  const resultingToken = await makeJwt({ header, payload, key });

  const responseObj = {
    token: resultingToken,
    expiration: payload.exp,
  };

  return responseObj;
}

export async function makeRefreshtoken(result: any) {
  var date = new Date();
  date.setDate(date.getDate() + 30 * 2);

  const key = env.REFRESHTOKENKEY;

  const objectRows = result.rowsOfObjects();
  const user = objectRows[0];

  const newjtiClaim = v4.generate();

  await db.query(
    "UPDATE users SET refresh_token = $1 WHERE refresh_token = $2 RETURNING *;",
    newjtiClaim,
    user.refresh_token,
  );

  const header: Jose = { alg: "HS256", typ: "JWT" };
  const payload: Payload = {
    name: user.name,
    email: user.email,
    jti: newjtiClaim,
    exp: setExpiration(date),
  };

  return await makeJwt({ header, payload, key });
}

export async function validateRefreshToken(jwt: any) {
  const key = env.REFRESHTOKENKEY;

  return await validateJwt({ jwt, key, algorithm: "HS256" });
}
