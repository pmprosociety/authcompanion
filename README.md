<p align="center">
  <a href="" rel="noopener">
 <img width=200px height=200px src="https://i.imgur.com/VjsHEC9.png" alt="Project logo"></a>
</p>

<h2 align="center">AuthCompanion</h2>

<p align="center"> An effortless, open source, token-based user management server - well suited for modern web projects.
</p>

<div align="center">

<a href="">
     <img alt="Active" src="https://img.shields.io/badge/status-early%20development-orange?">
   </a>
   <a href="https://github.com/pmprosociety/authcompanion/stargazers">
     <img alt="GitHub stars" src="https://img.shields.io/github/stars/pmprosociety/authcompanion">
   </a>
   <a href="">
     <img alt="GitHub license" src="https://img.shields.io/github/license/pmprosociety/authcompanion" />
   </a>
   <a href="https://deno.land">
     <img src="https://img.shields.io/badge/deno-1.10.2-green?logo=deno"/>
   </a>

</div>

---

## Introduction

AuthCompanion aims to satisfy the most common identity and user management needs
for single factor authentication.

Start by downloading the source code or use git, to clone this repository

```sh
$ git clone https://github.com/pmprosociety/authcompanion.git

$ cd authcompanion/
```

Copy the example config file and change the default values in the .env file (or
you know... keep it if you're just trying things out)

```sh
$ cp env.example .env
```

Spin up the AuthCompanion stack by running this
[docker compose](https://docs.docker.com/compose/install/) command:

```sh
$ docker-compose up
```

---

First, try out the [Web Forms](#web-forms-for-authentication) for user
authentication - starting with registering an account:
http://localhost:3002/client/v1/register

⚠️ Note: You'll be redirected back this repository after successfully
registering, that's OK! We can change this later to point to your application.

Next, log in with the account you just created:
http://localhost:3002/client/v1/login

Lastly, experience [registering](#authregister) another user, this time without
the web forms. Check out the [Authentication API](#authentication-api) instead.

See all the documentation below for clear examples 🚀.

---

## Features

- [x] **Login and Registration:** Create an account and sign in with an email
  and password via the RESTful Authentication API.
- [x] **Profile and Credentials Management:** Update the password and profile
  information of your users - account information is stored in a Postgres
  database.
- [x] **Account Recovery:** Restore a user's access to their account using the
  **Forgot Password** flow. This flow sends a special link via email for
  recovering an account quickly.
- [x] **Hooks:** Receive notifications via a webhook after a user has: logged
  in, registered, or updated their account. Hooks are used to trigger your
  integrations each time a user performs an authentication action, like logging
  in.
- [x] **Token Lifecycle & Logout:** Keep a user's access token fresh while they
  are using your application. Then, when a user is done in your app, securely
  log them out.
- [x] **Web Forms:** Use pre-built web forms for your application users to: log
  in with their credentials, register an account, update their profile, and
  issue forgotten passwords.

**Note:** the default configuration strives to be reasonable and sane for
gettings started with user authentication easily - extra hardening of the server
should be completed when moving to production environments.

## Web Forms for Authentication

The web forms for login, registration and forgot password are built using
[Vue.js](https://v3.vuejs.org/) and [Tailwindcss](https://tailwindcss.com/) -
making them easily customizable for your specific branding and auth needs. After
successful login or registration, the user's JWT is made available for
developers to use when authenticating a user into other APIs.

|             Login Screen              |            Registration Screen             |
| :-----------------------------------: | :----------------------------------------: |
| ![Login](./.github/public/login.png)  | ![Register](./.github/public/register.png) |
| http://localhost:3002/client/v1/login |  http://localhost:3002/client/v1/register  |

Other helpful web forms include: the profile page, available at `/profile` and
the forgot password page at `/recovery`.

## Authentication API

The RESTful Authentication API powers the web forms and can be used to build
your own authentication flows.

### Server URL

http://localhost:3002/api/v1/

### Paths

Returns Content-Type: application/json

### auth/register

Description: Register your first user. Returns a JWT access token and sets a
refresh token (as a http only cookie). JWTs are used by your applicaiton to
understand who a user is.

**POST** Request Body:

```yaml
{
    "name": "Authy Person",
    "email": "hello_world@authcompanion.com",
    "password": "mysecretpass"
}
```

Response:

```yaml
{
  "data": {
    "id": "6eee5ca5-d68f-4698-906d-62af6d705f05",
    "type": "Register",
    "attributes": {
      "name": "Authy Person",
      "email": "hello_world@authcompanion.com",
      "created": "2021-05-12T00:05:13.243Z",
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZlZWU1Y2E1LWQ2OGYtNDY5OC05MDZkLTYyYWY2ZDcwNWYwNSIsIm5hbWUiOiJBdXRoeSBQZXJzb24iLCJlbWFpbCI6ImhlbGxvX3dvcmxkQGF1dGhjb21wYW5pb24uY29tIiwiZXhwIjoxNjIwNzkyMzEzfQ.VpkhYRnAzIE75dWVOKLMKHocB2R0kCRsEV6DDctx2h8",
      "access_token_expiry": 1620792313
    }
  }
}
```

---

### auth/login

Description: If the request provides a valid username and password, return a JWT
access token and set a refresh token (as a http only cookie).

**POST** Request Body:

```yaml
{
    "email": "hello@authcompanion.com",
    "password": "mysecretpass"
}
```

Response:

```yaml
{
  "data": {
    "id": "6eee5ca5-d68f-4698-906d-62af6d705f05",
    "type": "Login",
    "attributes": {
      "name": "Authy Person",
      "email": "hello_world@authcompanion.com",
      "created": "2021-05-12T00:05:13.243Z",
      "updated": "2021-05-12T00:05:13.247Z",
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZlZWU1Y2E1LWQ2OGYtNDY5OC05MDZkLTYyYWY2ZDcwNWYwNSIsIm5hbWUiOiJBdXRoeSBQZXJzb24iLCJlbWFpbCI6ImhlbGxvX3dvcmxkQGF1dGhjb21wYW5pb24uY29tIiwiZXhwIjoxNjIwNzkyNDg2fQ.XPRAwMtkus2gd1MaTW2wDEs2SF048uOco_aAiQfTYhQ",
      "access_token_expiry": 1620792486
    }
  }
}
```

---

### auth/refresh

Description: If the request has a valid refresh token (stored as http only
cookie) return an access token and set a new refresh token http only cookie.

Sometimes your access token (JWTs) will expire. When they do, you can refresh
the access token without asking your user to log in again.

**POST** Request Body: None Required

Cookie required: refreshToken={user's refresh token}

Response:

```yaml
{
  "data": {
    "id": "6eee5ca5-d68f-4698-906d-62af6d705f05",
    "type": "Refresh",
    "attributes": {
      "name": "Authy Person",
      "email": "hello_world@authcompanion.com",
      "created": "2021-05-12T00:05:13.243Z",
      "updated": "2021-05-12T02:25:05.709Z",
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZlZWU1Y2E1LWQ2OGYtNDY5OC05MDZkLTYyYWY2ZDcwNWYwNSIsIm5hbWUiOiJBdXRoeSBQZXJzb24iLCJlbWFpbCI6ImhlbGxvX3dvcmxkQGF1dGhjb21wYW5pb24uY29tIiwiZXhwIjoxNjIwODAwODYwfQ.dqPcv27hxmWcYastcXgRyrHKE3lFvz4OD8wPz6yAmPM",
      "access_token_expiry": 1620800860
    }
  }
}
```

---

### auth/users/me

Description: Update the user's record by changing their name, email and
password.

**POST** Request Body:

```yaml
{
    "name": "Authy Person1",
    "email": "hello_world1@authcompanion.com",
    "password": "mysecretpass"
}
```

*password field is optional

Authorization Required: Bearer {user's access token}

Response:

```yaml
{
  "data": {
    "id": "6eee5ca5-d68f-4698-906d-62af6d705f05",
    "type": "Updated User",
    "attributes": {
      "name": "Authy Person1",
      "email": "hello_world1@authcompanion.com",
      "created": "2021-05-12T00:05:13.243Z",
      "updated": "2021-05-12T02:29:06.708Z",
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZlZWU1Y2E1LWQ2OGYtNDY5OC05MDZkLTYyYWY2ZDcwNWYwNSIsIm5hbWUiOiJBdXRoeSBQZXJzb24xIiwiZW1haWwiOiJoZWxsb193b3JsZDFAYXV0aGNvbXBhbmlvbi5jb20iLCJleHAiOjE2MjA4MDA5NDd9.44lKad-6le-wmofkQ9QebIkdB6QtotnvAW7aApxfiA0",
      "access_token_expiry": 1620800947
    }
  }
}
```

---

### auth/recovery

Description: If the request has a valid user email, issue an account recovery
email which contains a URL with a recovery token in the query parameters
(referred to as a Magic Link). Works together with '/auth/recovery/' to restore
a user's access to an account. Your application UI will be responsible for 1)
trading the recovery token for an access token using 'auth/recovery/token'
below 2) handling where to route the user within the application once
successful.

**POST** Request Body:

```yaml
{
    "email": "hello_world@authcompanion.com"
}
```

Response:

```yaml
{
  "data": {
    "type": "Recover User",
    "detail": "An email containing a recovery link has been sent to the email address provided."
  }
}
```

---

### auth/recovery/token

Description: If the request has a valid and short lived recovery token (issued
from the recovery email), trade it for a new access token, so the user can
login. This completed the "Forgot Password" user flow!

**POST** Request Body:

```yaml
{
    "token": "{user's recovery token here}"
}
```

Response:

```yaml
{
  "data": {
    "type": "Recovery Login",
    "attributes": {
      "name": "Authy Person1",
      "email": "hello_world1@authcompanion.com",
      "created": "2021-05-12T00:05:13.243Z",
      "updated": "2021-05-12T02:35:00.443Z",
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZlZWU1Y2E1LWQ2OGYtNDY5OC05MDZkLTYyYWY2ZDcwNWYwNSIsIm5hbWUiOiJBdXRoeSBQZXJzb24xIiwiZW1haWwiOiJoZWxsb193b3JsZDFAYXV0aGNvbXBhbmlvbi5jb20iLCJleHAiOjE2MjA4MDE0MDl9.sUhT-tDK_ZW4zADhfBku6Z9mMDm6yuELYfDgmwLojz4",
      "access_token_expiry": 1620801409
    }
  }
}
```

---

### auth/logout

Description: Call this endpoint when the user clicks 'log out'. Only the user's
refresh token will be invalidated using this route. Authorization tokens are
still valid for the period of their expiration date. This means, the UI is
responsible for implementation of these APIs should remove the Authorization
token from the application memory and require the user to login again to receive
a new token.

**GET** Request Body: None Required

Authorization Required: Bearer {user's access token}

Response:

```yaml
{
  "data": {
    "id": "6eee5ca5-d68f-4698-906d-62af6d705f05",
    "type": "Logout User",
    "attributes": {
      "name": "Authy Person1",
      "email": "hello_world1@authcompanion.com"
    }
  }
}
```

---

## Related Readings

Be sure to familiarize yourself with token-based authentication using JSON Web
Tokens.

- [The Ultimate Guide to handling JWTs on frontend
  clients](https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/)

- [Web Authentication Method Comparison](https://testdriven.io/blog/web-authentication-methods/#token-based-authentication)

## License

AuthCompanion is licensed under the [MIT](https://opensource.org/licenses/MIT)

## Contributions

Author: Paul Fischer [(Github)](https://github.com/pmprosociety)

Contributors: Teddy Schmitz [(Github)](https://github.com/Teddy-Schmitz)

Logo Design - Timothy Reeder [(Github)](https://github.com/tokonoma)

Take AuthCompanion, the useful sidekick, into your next web project! 👏
