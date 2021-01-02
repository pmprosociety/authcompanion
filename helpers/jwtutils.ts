import { create, decode, getNumericDate, verify } from "../deps.ts";
import { Header, Payload } from "../deps.ts";
import { config } from "../deps.ts";
import { v4 } from "../deps.ts";

import { db } from "../db/db.ts";
import log from "./log.ts";

const env = config();

export async function makeAccesstoken(result: any) {
  var date = new Date();
  date.setHours(date.getHours() + 4);

  const key = env.ACCESSTOKENKEY;

  const objectRows = result.rowsOfObjects();
  const user = objectRows[0];

  const jwtheader: Header = { alg: "HS256", typ: "JWT" };
  const jwtpayload: Payload = {
    id: user.UUID,
    name: user.name,
    email: user.email,
    exp: getNumericDate(date),
  };

  const resultingToken = await create(jwtheader, jwtpayload, key);

  const responseObj = {
    token: resultingToken,
    expiration: jwtpayload.exp,
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

  const jwtheader: Header = { alg: "HS256", typ: "JWT" };
  const jwtpayload: Payload = {
    id: user.UUID,
    name: user.name,
    email: user.email,
    jti: newjtiClaim,
    exp: getNumericDate(date),
  };

  return await create(jwtheader, jwtpayload, key);
}

export async function validateRefreshToken(jwt: any) {
  const key = env.REFRESHTOKENKEY;
  try {
    //verify the jwt
    await verify(jwt, key, "HS256");

    //decode the jwt
    let validatedToken = await decode(jwt);

    return validatedToken;
  } catch (err) {
    log.warning(err);
    throw new Error("Reresh Token is Invalid");
  }
}

export async function validateJWT(jwt: any) {
  const key = env.ACCESSTOKENKEY;
  try {
    //verify the jwt (includes signature validation) otherwise throw error
    await verify(jwt, key, "HS256");

    //decode the jwt (without signature verfication) otherwise throw error
    let validatedToken = await decode(jwt);

    return validatedToken;
  } catch (err) {
    log.warning(err);
    throw new Error("Access Token is Invalid");
  }
}

export async function makeRecoverytoken(result: any) {
  var date = new Date();
  date.setMinutes(date.getMinutes() + 10);

  const key = env.ACCESSTOKENKEY;

  const objectRows = result.rowsOfObjects();
  const user = objectRows[0];

  const jwtheader: Header = { alg: "HS256", typ: "JWT" };
  const jwtpayload: Payload = {
    id: user.UUID,
    name: user.name,
    email: user.email,
    exp: getNumericDate(date),
  };

  const resultingToken = await create(jwtheader, jwtpayload, key);

  const responseObj = {
    token: resultingToken,
    expiration: jwtpayload.exp,
  };

  return responseObj;
}
