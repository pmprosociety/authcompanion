import { assertEquals } from "https://deno.land/std@0.85.0/testing/asserts.ts";
import { db } from "../db/db.ts";
import {
  makeAccesstoken,
  makeRecoverytoken,
  makeRefreshtoken,
} from "../helpers/jwtutils.ts";

/*
Prerequisite: use deno run --watch -A --unstable bin/server.ts 
to start the API server locally (or docker) before running test cases.

Test cases assume both the test API and database is running before executing the tests.
*/

async function cleanTestData() {
  await db.connect();

  const result = await db.query(
    "DELETE FROM users WHERE email = $1;",
    "test_case@authcompanion.com",
  );

  await db.end();
}

Deno.test("API Endpoint Test: /auth/register", async () => {
  const requestBody = {
    "name": "Authy Man Testcases",
    "email": "test_case@authcompanion.com",
    "password": "mysecretpass",
  };

  let res = await fetch(
    "http://localhost:3001/api/v1/auth/register",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    },
  );
  const json = await res.json();
  assertEquals(
    res.ok,
    true,
    "The API did not return a successful response; check server logs",
  );
});

Deno.test("API Endpoint Test: /auth/login", async () => {
  const requestBody = {
    "email": "hello_world1@authcompanion.com",
    "password": "mysecretpass",
  };

  let res = await fetch(
    "http://localhost:3001/api/v1/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    },
  );
  const json = await res.json();
  assertEquals(
    res.ok,
    true,
    "The API did not return a successful response; check server logs",
  );
});

Deno.test("API Endpoint Test: /auth/refresh", async () => {
  await db.connect();

  const result = await db.query(
    "SELECT * FROM users WHERE email = $1;",
    "test_case@authcompanion.com",
  );

  const refreshToken = await makeRefreshtoken(result);

  let res2 = await fetch(
    "http://localhost:3001/api/v1/auth/refresh",
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        cookie: `refreshToken=${refreshToken}`,
      },
    },
  );
  const json = await res2.json();

  await db.end();

  assertEquals(
    res2.ok,
    true,
    "The API did not return a successful response; check server logs",
  );
});

Deno.test("API Endpoint Test: /auth/users/me", async () => {
  const requestBody = {
    "name": "Authy Man Testcases",
    "email": "test_case@authcompanion.com",
    "password": "mysecretpass",
  };

  await db.connect();

  const result = await db.query(
    "SELECT * FROM users WHERE email = $1;",
    requestBody.email,
  );

  const accessToken = await makeAccesstoken(result);

  let res2 = await fetch(
    "http://localhost:3001/api/v1/auth/users/me",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + accessToken.token,
      },
      body: JSON.stringify(requestBody),
    },
  );
  const json = await res2.json();

  await db.end();

  assertEquals(
    res2.ok,
    true,
    "The API did not return a successful response; check server logs",
  );
});

Deno.test("API Endpoint Test: /auth/recovery", async () => {
  const requestBody = {
    "email": "test_case@authcompanion.com",
  };

  await db.connect();

  const result = await db.query(
    "SELECT * FROM users WHERE email = $1;",
    requestBody.email,
  );

  const accessToken = await makeAccesstoken(result);

  let res2 = await fetch(
    "http://localhost:3001/api/v1/auth/recovery",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    },
  );
  const json = await res2.json();

  await db.end();

  assertEquals(
    res2.ok,
    true,
    "The API did not return a successful response; check server logs",
  );
});

Deno.test("API Endpoint Test: /auth/recovery/token", async () => {
  await db.connect();

  const result = await db.query(
    "SELECT * FROM users WHERE email = $1;",
    "test_case@authcompanion.com",
  );

  const recoveryToken = await makeRecoverytoken(result);

  let res2 = await fetch(
    "http://localhost:3001/api/v1/auth/recovery/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: recoveryToken.token }),
    },
  );
  const json = await res2.json();

  await db.end();

  assertEquals(
    res2.ok,
    true,
    "The API did not return a successful response; check server logs",
  );
});

Deno.test("API Endpoint Test: /auth/logout", async () => {
  await db.connect();

  const result = await db.query(
    "SELECT * FROM users WHERE email = $1;",
    "test_case@authcompanion.com",
  );
  const accessToken = await makeAccesstoken(result);

  let res2 = await fetch(
    "http://localhost:3001/api/v1/auth/logout",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + accessToken.token,
      },
    },
  );
  const json = await res2.json();

  await db.end();

  await cleanTestData();

  assertEquals(
    res2.ok,
    true,
    "The API did not return a successful response; check server logs",
  );
});
