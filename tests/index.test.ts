// @ts-nocheck
import app from "../app.ts";
import { assertEquals, assertExists } from "../test_deps.ts";
import { Context } from "../test_deps.ts";
import { db } from "../db/db.ts";
import {
  makeAccesstoken,
  makeRecoverytoken,
  makeRefreshtoken,
  validateJWT,
} from "../helpers/jwtutils.ts";
import { registration } from "../services/registration.ts";
import { login } from "../services/login.ts";
import { refresh } from "../services/refresh.ts";
import { userSettings } from "../services/userSettings.ts";
import { recoverToken } from "../services/recoverytoken.ts";
import { logout } from "../services/logout.ts";
import { accountRecovery } from "../services/accountRecovery.ts";
import authorize from "../middlewares/authorize.ts";

const encoder = new TextEncoder();

async function cleanTestData() {
  await db.queryObject(
    "DELETE FROM users WHERE email = $1;",
    "test_pass@authcompanion.com",
  );
  await db.release();
}

function createMockBodyReader(body: string): Deno.Reader {
  const buf = encoder.encode(body);
  let offset = 0;
  return {
    read(p: Uint8Array): Promise<number | null> {
      if (offset >= buf.length) {
        return Promise.resolve(null);
      }
      const chunkSize = Math.min(p.length, buf.length - offset);
      p.set(buf);
      offset += chunkSize;
      return Promise.resolve(chunkSize);
    },
  };
}

function createMockServerRequest(
  {
    url = "/",
    host = "localhost",
    body,
    headerValues = {},
    proto = "HTTP/1.1",
  }: MockServerRequestOptions = {},
): ServerRequest {
  const headers = new Headers();
  headers.set("host", host);
  for (const [key, value] of Object.entries(headerValues)) {
    headers.set(key, value);
  }
  if (body && body.length && !headers.has("content-length")) {
    headers.set("content-length", String(body.length));
  }
  return {
    headers,
    method: "POST",
    url,
    proto,
    body: body && createMockBodyReader(body),
    async respond() {},
    // deno-lint-ignore no-explicit-any
  } as any;
}

Deno.test("API Endpoint Test: /auth/register", async () => {
  const requestBody = {
    "name": "Authy Person Testcases",
    "email": "test_pass@authcompanion.com",
    "password": "mysecretpass",
  };

  const serverRequest = createMockServerRequest({
    body: JSON.stringify(requestBody),
    headerValues: { "content-type": "application/json" },
  });

  const ctx = new Context(
    app,
    serverRequest,
  );

  await registration(ctx);

  assertEquals(
    ctx.response.status,
    201,
    "The API did not return a successful response",
  );
});

Deno.test("API Endpoint Test: /auth/login", async () => {
  const requestBody = {
    "email": "test_pass@authcompanion.com",
    "password": "mysecretpass",
  };

  const serverRequest = createMockServerRequest({
    body: JSON.stringify(requestBody),
    headerValues: { "content-type": "application/json" },
  });

  const ctx = new Context(
    app,
    serverRequest,
  );

  await login(ctx);

  assertEquals(
    ctx.response.status,
    200,
    "The API did not return a successful response",
  );

  let { payload } = await validateJWT(
    ctx.response.body.data.attributes.access_token,
  );
  assertExists(payload.id, "Token did not exist");
});

Deno.test("API Endpoint Test: /auth/refresh", async () => {
  const result = await db.queryObject(
    "SELECT * FROM users WHERE email = $1;",
    "test_pass@authcompanion.com",
  );

  const refreshToken = await makeRefreshtoken(result);

  const serverRequest = createMockServerRequest({
    headerValues: {
      "content-type": "application/json",
      "Cookie": `refreshToken=${refreshToken}`,
    },
  });

  const ctx = new Context(
    app,
    serverRequest,
  );

  await refresh(ctx);

  await db.release();
  assertEquals(
    ctx.response.status,
    200,
    "The API did not return a successful response",
  );
});

Deno.test("API Endpoint Test: /auth/users/me", async () => {
  const requestBody = {
    "name": "Authy Man Testcases",
    "email": "test_pass@authcompanion.com",
    "password": "mysecretpass",
  };

  const result = await db.queryObject(
    "SELECT * FROM users WHERE email = $1;",
    requestBody.email,
  );

  const accessToken = await makeAccesstoken(result);

  const ctx = new Context(
    app,
    createMockServerRequest({
      headerValues: {
        "content-type": "application/json",
        "Authorization": `Bearer ${accessToken.token}`,
      },
      body: JSON.stringify(requestBody),
    }),
  );

  await db.release();

  await authorize(ctx, () => {});

  assertEquals(
    ctx.response.status,
    404,
    "The authorize middlware threw error.",
  );

  let { payload } = await validateJWT(accessToken.token);

  ctx.state.JWTclaims = payload;

  await userSettings(ctx);

  assertEquals(
    ctx.response.status,
    200,
    "The API did not return a successful response",
  );
});

// Deno.test("API Endpoint Test: /auth/recovery", async () => {
//   const requestBody = {
//     "email": "test_pass@authcompanion.com",
//   };

//   const serverRequest = createMockServerRequest({
//     headerValues: { "content-type": "application/json" },
//     body: JSON.stringify(requestBody),
//   });

//   const ctx = new Context(
//     app,
//     serverRequest,
//   );

//   await accountRecovery(ctx);

//   assertEquals(
//     ctx.response.status,
//     200,
//     "The API did not return a successful response; check server logs",
//   );
// });

Deno.test("API Endpoint Test: /auth/recovery/token", async () => {
  const result = await db.queryObject(
    "SELECT * FROM users WHERE email = $1;",
    "test_pass@authcompanion.com",
  );

  const recoveryToken = await makeRecoverytoken(result);

  const ctx = new Context(
    app,
    createMockServerRequest({
      headerValues: { "content-type": "application/json" },
      body: JSON.stringify({ token: recoveryToken.token }),
    }),
  );

  await db.release();

  await recoverToken(ctx);

  assertEquals(
    ctx.response.status,
    200,
    "The API did not return a successful response; check server logs",
  );
});

Deno.test("API Endpoint Test: /auth/logout", async () => {
  const requestBody = {
    "name": "Authy Man Testcases",
    "email": "test_pass@authcompanion.com",
    "password": "mysecretpass",
  };

  const result = await db.queryObject(
    "SELECT * FROM users WHERE email = $1;",
    requestBody.email,
  );

  const accessToken = await makeAccesstoken(result);
  const ctx = new Context(
    app,
    createMockServerRequest({
      headerValues: {
        "content-type": "application/json",
        "Authorization": `Bearer ${accessToken.token}`,
      },
      body: JSON.stringify(requestBody),
    }),
  );

  await db.release();

  await authorize(ctx, () => {});

  assertEquals(
    ctx.response.status,
    404,
    "The authorize middlware threw error.",
  );

  let { payload } = await validateJWT(accessToken.token);
  ctx.state.JWTclaims = payload;

  await logout(ctx);

  // Clean out the test data from the DB (helpful when running tests locally)
  await cleanTestData();

  assertEquals(
    ctx.response.status,
    200,
    "The API did not return a successful response; check server logs",
  );
});
