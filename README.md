<p align="center">
  <a href="https://authcompanion.com/" rel="noopener">
 <img width=200px height=200px src="https://i.imgur.com/VjsHEC9.png" alt="Project logo"></a>
</p>

<h2 align="center">AuthCompanion</h2>

<p align="center"> Effortless, open source, identity and user management for software developers
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
     <img src="https://img.shields.io/badge/deno-%5E1.4.5-green?logo=deno"/>
   </a>
   <a href="">
     <img src="http://hits.dwyl.com/pmprosociety/authcompanion.svg" />
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

Ensure Docker is installed - https://docs.docker.com/get-docker/

Create the AuthCompanion stack by navigating to the main project directory and running the docker command:

```sh
docker-compose up
```

🚀 The API server will be ready on localhost:3001/api/v1/auth/

### Register your first user

```sh
curl --location --request POST 'localhost:3001/api/v1/auth/register' \
--header 'Content-Type: application/json' \
--data-raw '{"name": "Authy Man", "email": "authy.man@authcompanion.com", "password": "supersecretpass"}'
```

## Features

- [x] **Login and Registration:** Users can create and sign into accounts using email and password.
- [x] **Profile and Credentials Management:** Update password and profile information. 
- [ ] **Account Recovery:** Restore user access using flows for "Forgot Password" and Security Codes.
- [ ] **Multi-Factor Authentication:** Supporting TOTP protocols.
- [ ] **Acount Verifcation:** Verify that a phone number belongs to that identity.
- [ ] **Admin APIs:** Manage lifecycle operations for a user's status (active/deactive) and JWT tokens

AuthCompanion development is opinionated in nature; taking the path which satisfies the broadest use cases, as securely as possible. We keep the configuration options low in order to make onboarding onto AuthCompanion easy for developers. AuthCompanion ships without HTML Rendering, so you'll need to bring your own UI framework to make use of the feature APIs.

Take this useful sidekick into your next project! 👏

## Related Readings

- [The Ultimate Guide to handling JWTs on frontend clients](https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/)

## License

AuthCompanion is licensed under the [MIT](https://opensource.org/licenses/MIT) license.

## Contributions
Author: Paul Fischer [(Github)](https://github.com/pmprosociety)
Logo Design - Timothy Reeder [(Github)](https://github.com/tokonoma)
