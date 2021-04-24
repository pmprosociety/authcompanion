<p align="center">
  <a href="https://authcompanion.com/" rel="noopener">
 <img width=200px height=200px src="https://i.imgur.com/VjsHEC9.png" alt="Project logo"></a>
</p>

<h2 align="center">AuthCompanion</h2>

<p align="center"> An effortless, open source, token-based user management server - well suited for
microservices and static website projects.
</p>

<div align="center">

<a href="https://authcompanion.com">
     <img alt="Active" src="https://img.shields.io/badge/status-early%20development-orange">
   </a>
   <a href="https://github.com/pmprosociety/authcompanion/issues">
     <img alt="GitHub issues" src="http://img.shields.io/github/issues/pmprosociety/authcompanion">
   </a>
   <a href="https://github.com/pmprosociety/authcompanion/stargazers">
     <img alt="GitHub stars" src="https://img.shields.io/github/stars/pmprosociety/authcompanion">
   </a>
   <a href="">
     <img alt="GitHub license" src="https://img.shields.io/github/license/pmprosociety/authcompanion" />
   </a>
   <a href="https://deno.land">
     <img src="https://img.shields.io/badge/deno-1.9.1-green?logo=deno"/>
   </a>

</div>

---

## Getting Started

### Docker Deployment

To run AuthCompanion, first clone using git from this repository.

```sh
git clone https://github.com/pmprosociety/authcompanion.git

cd authcompanion
```

Copy the example config file and change the default values in the .env file (or
you know... keep it if you're just trying things out)

```sh
cp env.example .env
```

Spin up the AuthCompanion stack by running this docker compose command:

```sh
docker-compose up
```

🚀 The API server will be ready on localhost. See documentation below.

## Features

AuthCompanion aims to satisfy your most common identity and user management
needs for single factor authentication. The server includes APIs for:

- [x] **Login and Registration:** Create and sign into accounts using email and
  password - users are stored in AuthCompanion's Postgres database.
- [x] **Profile and Credentials Management:** Update the password and profile
  information of your users using AuthCompanion's REST APIs.
- [x] **Account Recovery:** Restore a user's access to their account using the
  **Forgot Password** flow. This flow includes a special link for recovering an
  account quickly.
- [x] **Token Lifecycle & Logout:** Keep the user's token refreshed while they
  are using your application. Then, when a user is done in your app, securely
  log them out.

⚠️ Note: AuthCompanion ships without HTML Rendering, so you'll need to bring
your own UI framework to make use of these feature APIs. We have a demo below
that can help get you started.

## Who is this for?

AuthCompanion is a JavaScript server which helps you build web application **faster**.

The default configuration strives to be reasonable, sane and reliable for
gettings started easily - extra hardening should be done when moving to production
environments.

We ensure that AuthCompanion can be useful right away and run smoothly... without
having to study the docs for hours.

## Demo

The vue starter app is an example UI to help guide you in implementing
AuthCompanion's APIs: https://github.com/pmprosociety/authcompanion-vue-starter

(uses Vue 3 + Vite + Tailwind CSS)

## Related Readings

Be sure to familiarize yourself with token-based authentication using JSON Web
Tokens.

- [The Ultimate Guide to handling JWTs on frontend
  clients](https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/)

- [Web Authentication Method Comparison](https://testdriven.io/blog/web-authentication-methods/#token-based-authentication)

## API Documentation

### Server

http://localhost:3002/api/v1/

### Paths

Content-Type: application/json

### /auth/register

Description: Register your first user.

**POST** Request Body:
`{ "name":"Authy Man", "email":"hello_world@authcompanion.com", "password":"mysecretpass" }`

---

### /auth/login

Description: If the request provides a valid username and password, return a JWT
access token and set a refresh token (as a http only cookie).

**POST** Request Body:
`{ "email":"hello@authcompanion.com", "password":"mysecretpass" }`

---

### /auth/refresh

Description: If the request has a valid refresh token (stored as cookie) return
an access token and set a new refresh token cookie.

**POST** Request Body: None Required

Cookie required: refreshToken=_user's refresh token_

---

### /auth/users/me

Description: Update the user's record by changing the name, email and password.

**POST** Request Body:
`{ "name":"Authy Man", "email":"hello_world@authcompanion.com", "password":"mysecretpass" }`
*password field is optional

Authorization Required: Bearer _user's access token_

---

### /auth/recovery

Description: If the request has a valid user, issue an account recovery email
which contains a URL with a recovery token in the query parameters. Works
together with '/auth/recovery/' to restore a user's access to an account. UI
will be responsible for 1) trading the recovery token for an access token using
'auth/recovery/token' below 2) handling how to route the user within the
application.

**POST** Request Body: `{ "email":"hello_world@authcompanion.com" }`

---

### auth/recovery/token

Description: If the request has a valid and short lived recovery token (issued
from the recovery email), trade it for a new access token, so the user can
login.

**POST** Request Body: `{ "token":"_recovery token here_" }`

---

### /auth/logout

Description: Only the user's refresh token will be invalidated using this route.
Authorization tokens are still valid for the period of their expiration date.
This means, the UI is responsible for implementation of these APIs should remove
the Authorization token from the application memory and require the user to
login to receive a new token.

**GET** Request Body: None Required

Authorization Required: Bearer _user's access token_

---

## License

AuthCompanion is licensed under the [MIT](https://opensource.org/licenses/MIT)
license.

## Contributions

Author: Paul Fischer [(Github)](https://github.com/pmprosociety)

Contributors: Teddy Schmitz [(Github)](https://github.com/Teddy-Schmitz)

Logo Design - Timothy Reeder [(Github)](https://github.com/tokonoma)

Take AuthCompanion, the useful sidekick, into your next web project! 👏
