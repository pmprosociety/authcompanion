import app from "../app.ts";
import { assertEquals } from "https://deno.land/std@0.85.0/testing/asserts.ts";
import { BufReader, BufWriter, Context } from "../test_deps.ts";
import { db } from "../db/db.ts";
import {
  makeAccesstoken,
  makeRecoverytoken,
  makeRefreshtoken,
} from "../helpers/jwtutils.ts";
import { signUp } from "../services/signUp.ts";
import { signIn } from "../services/signIn.ts";
import { refresh } from "../services/refresh.ts";
import { updateUser } from "../services/updateUser.ts";
import { recoverToken } from "../services/recoverytoken.ts";
import { logoutUser } from "../services/logout.ts";
import authorize from "../middlewares/authorize.ts";
import { forgotPassword } from "../services/forgotPassword.ts";

const encoder = new TextEncoder();

async function cleanTestData() {
  const result = await db.queryObject(
    "DELETE FROM users WHERE email = $1;",
    "test_case@authcompanion.com",
  );

  await db.release();
}

interface MockServerOptions {
  headers?: [string, string][];
  proto?: string;
  url?: string;
  body?: string;
  headerValues?: Record<string, string>;
}

interface ServerResponse {
  status: number;
  headers: Headers;
  body: Uint8Array | Deno.Reader | undefined;
}

interface ServerRequest {
  body: Deno.Reader;
  conn: Deno.Conn;
  headers: Headers;
  method: string;
  r: BufReader;
  respond(response: ServerResponse): Promise<void>;
  url: string;
  w: BufWriter;
}

function createMockBodyReader(body: string): Deno.Reader {
  const buf = encoder.encode(body);
  let offset = 0;
  return {
    async read(p: Uint8Array): Promise<number | null> {
      if (offset >= buf.length) {
        return null;
      }
      const chunkSize = Math.min(p.length, buf.length - offset);
      p.set(buf);
      offset += chunkSize;
      return chunkSize;
    },
  };
}

function createMockServerRequest(
  {
    url = "/",
    proto = "HTTP/1.1",
    body = "",
    headerValues = {},
    headers: headersInit = [["host", "localhost"]],
  }: MockServerOptions = {},
): ServerRequest {
  const headers = new Headers(headersInit);
  for (const [key, value] of Object.entries(headerValues)) {
    headers.set(key, value);
  }
  if (body.length && !headers.has("content-length")) {
    headers.set("content-length", String(body.length));
  }
  return {
    conn: {
      close() {},
    },
    w: new BufWriter(new Deno.Buffer(new Uint8Array())),
    headers,
    method: "POST",
    proto,
    url,
    body: createMockBodyReader(body),
    async respond() {},
  } as any;
}

Deno.test("API Endpoint Test: /auth/register", async () => {
  const requestBody = {
    "name": "Authy Man Testcases",
    "email": "test_case@authcompanion.com",
    "password": "mysecretpass",
  };

  const ctx = new Context(
    app,
    createMockServerRequest({
      body: JSON.stringify(requestBody),
      headerValues: { "content-type": "application/json" },
    }),
  );

  await signUp(ctx);

  assertEquals(
    ctx.response.status,
    201,
    "The API did not return a successful response; check server logs",
  );
});

Deno.test("API Endpoint Test: /auth/login", async () => {
  const requestBody = {
    "email": "test_case@authcompanion.com",
    "password": "mysecretpass",
  };

  const ctx = new Context(
    app,
    createMockServerRequest({
      body: JSON.stringify(requestBody),
      headerValues: { "content-type": "application/json" },
    }),
  );

  await signIn(ctx);

  assertEquals(
    ctx.response.status,
    200,
    "The API did not return a successful response; check server logs",
  );
});

Deno.test("API Endpoint Test: /auth/refresh", async () => {
  const result = await db.queryObject(
    "SELECT * FROM users WHERE email = $1;",
    "test_case@authcompanion.com",
  );

  const refreshToken = await makeRefreshtoken(result);

  const ctx = new Context(
    app,
    createMockServerRequest({
      headerValues: {
        "content-type": "application/json",
        "Cookie": `refreshToken=${refreshToken}`,
      },
    }),
  );

  await refresh(ctx);

  await db.release();
  assertEquals(
    ctx.response.status,
    200,
    "The API did not return a successful response; check server logs",
  );
});


Deno.test("API Endpoint Test: /auth/users/me", async () => {
  const requestBody = {
    "name": "Authy Man Testcases",
    "email": "test_case@authcompanion.com",
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
  await updateUser(ctx);

  assertEquals(
    ctx.response.status,
    200,
    "The API did not return a successful response; check server logs",
  );
});

Deno.test("API Endpoint Test: /auth/users/me No Auth Header", async () => {
  const requestBody = {
    "name": "Authy Man Testcases",
    "email": "test_case@authcompanion.com",
    "password": "mysecretpass",
  };

  const ctx = new Context(
      app,
      createMockServerRequest({
        headerValues: {
          "content-type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }),
  );

  await authorize(ctx, () => {});
 // await updateUser(ctx);

  assertEquals(
      ctx.response.status,
      401,
      "The API did not return a proper response; check server logs",
  );
});

// Deno.test("API Endpoint Test: /auth/recovery", async () => {
//   const requestBody = {
//     "email": "test_case@authcompanion.com",
//   };
//
//
//     const ctx = new Context(app, createMockServerRequest({
//         headerValues: {"content-type": "application/json" },
//         body: JSON.stringify(requestBody),
//     }));
//
//   await forgotPassword(ctx)
//
//   assertEquals(
//     ctx.response.status,
//     200,
//     "The API did not return a successful response; check server logs",
//   );
// });

Deno.test("API Endpoint Test: /auth/recovery/token", async () => {
  const result = await db.queryObject(
    "SELECT * FROM users WHERE email = $1;",
    "test_case@authcompanion.com",
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
  const result = await db.queryObject(
    "SELECT * FROM users WHERE email = $1;",
    "test_case@authcompanion.com",
  );
  const accessToken = await makeAccesstoken(result);

  const ctx = new Context(
    app,
    createMockServerRequest({
      headerValues: {
        "content-type": "application/json",
        "Authorization": `Bearer ${accessToken.token}`,
      },
    }),
  );

  await db.release();

  await logoutUser(ctx);

  assertEquals(
    ctx.response.status,
    200,
    "The API did not return a successful response; check server logs",
  );
});

await cleanTestData();
