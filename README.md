<p align="center">
  <a href="https://authcompanion.com/" rel="noopener">
 <img width=200px height=200px src="https://i.imgur.com/VjsHEC9.png" alt="Project logo"></a>
</p>

<h2 align="center">AuthCompanion</h2>

<p align="center"> Effortless, open source, identity and user management for software integrators
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
     <img src="https://img.shields.io/badge/deno-1.5.2-green?logo=deno"/>
   </a>

</div>

---

For more information visit [AuthCompanion.com](https://authcompanion.com/)

## Getting Started

To run AuthCompanion, download the source code or clone using git from this repository.

```sh
git clone https://github.com/pmprosociety/authcompanion.git

cd authcompanion
```

Copy the example config file and change the default values in the .env file

```sh
cp env.example .env
```

Ensure Docker is installed - link if you need it: https://docs.docker.com/get-docker/

Spin up AuthCompanion by navigating to the main project directory and running the docker command:

```sh
docker-compose up
```

🚀 The API server will be ready on localhost. See documentation below. 

## Who is this for?

AuthCompanion’s development is opinionated.  That means the default configuration should be secure, sane and ready for production.  Configuration changes are kept to a minimum, ensuring that Authcompanion can start-up quickly and run smoothly in any environment - without having to study the docs for hours. 

We aim to keep complexity to the minimum.  If you are interested in a new feature please open an issue to discuss it before starting work.  We want to make sure any new features align to our AuthCompanion's tenants of simplicity and ease of use.

Think of AuthCompanion as a base template for user management; which helps you to build web application prototypes FASTER.  

## Features
AuthCompanion fulfills the most common identity and user management needs for web applications, including:

- [x] **Login and Registration:** Users can create and sign into accounts using email and password. Users are stored in a Postgres environment.
- [x] **Profile and Credentials Management:** Update password and profile information using RESTful APIs. 
- [x] **Account Recovery:** Restore user access using flows for "Forgot Password" and a Magic Link. Email is used as the user notification mechanism. 

AuthCompanion ships without HTML Rendering, so you'll need to bring your own UI framework to make use of the feature APIs.

## Related Readings

Famlilarize yourself with token-based authentication using JSON Web Tokens.

- [The Ultimate Guide to handling JWTs on frontend clients](https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/)

- [Web Authentication Method Comparison](https://testdriven.io/blog/web-authentication-methods/#token-based-authentication)


## API Documentation

### Server
http://localhost:300/api/v1/

### Paths
Content-Type: application/json

### /auth/register
Description: Register your first user!

**POST**
Request Body:
`{ "name":"Authy Man", "email":"hello_world@authcompanion.com", "password":"mysecretpass" }`

---

### /auth/login
Description: If the request has a valid username and password, return a JWT access token and set a refresh token.

**POST**
Request Body:
`{ "email":"hello@authcompanion.com", "password":"mysecretpass" }` 

---

### /auth/refresh
Description: If the request has a valid refresh token (stored as cookie) return a access token and set a new refresh token cookie.

**POST**
Request Body: No body required

Cookie required: refreshToken=_users refresh token_

---

### /auth/users/me
Description: Update the user's record by changing the name, email and password.

**POST**
Request Body:
`{ "name":"Authy Man", "email":"hello_world@authcompanion.com", "password":"mysecretpass" }` 
*password field is optional

Authorization: Bearer _user's access token here_

---

### /auth/recovery
Description: If the request has a valid user, issue an account recovery email which contains a URL with a recovery token in the query parameters. Works together with '/auth/recovery/' to restore a user's access to an account. UI will be responsible for 1) trading the recovery token for an access token using 'auth/recovery/token' below 2) handling how to route the user within the application.

**POST**
Request Body:
`{ "email":"hello_world@authcompanion.com" }` 

---

### auth/recovery/token
Description: If the request has a valid short lived recovery token, issue a new access token. 

**POST**
Request Body:
`{ "token":"_recovery token here_" }` 

---

## License

AuthCompanion is licensed under the [MIT](https://opensource.org/licenses/MIT) license.

## Contributions
Author: Paul Fischer [(Github)](https://github.com/pmprosociety)

Contributors: Teddy Schmitz [(Github)](https://github.com/Teddy-Schmitz)

Logo Design - Timothy Reeder [(Github)](https://github.com/tokonoma)

Take AuthCompanion, the useful sidekick, into your next web project! 👏
