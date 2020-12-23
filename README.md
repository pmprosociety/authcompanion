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

## Who is this for?

AuthCompanion’s development is opinionated.  That means the default configuration should be secure, sane and ready for production.  Configuration changes are kept to a minimum, ensuring that Authcompanion can start-up quickly and run smoothly in any environment - without having to study the docs for hours. 

We aim to keep complexity to the minimum.  If you are interested in a new feature please open an issue to discuss it BEFORE starting work.  We want to make sure any new features align to our core tenants of simplicity and ease of use.

AuthCompanion is a base template for user management which helps you build web application prototypes FASTER.  

Take AuthCompanion, the useful sidekick, into your next web project! 👏

## Features
AuthCompanion fulfills the most common identity and user management needs for web applications, including:

- [x] **Login and Registration:** Users can create and sign into accounts using email and password. Data is stored in a Postgres environment.
- [x] **Profile and Credentials Management:** Update password and profile information using RESTful APIs. 
- [ ] **Account Recovery:** Restore user access using flows for "Forgot Password" and Security Codes. Email is used as the user notification mechanism. 
- [ ] **Multi-Factor Authentication:** Supporting TOTP protocols via email.
- [ ] **Account Verification:** Verify that an email belongs to that identity, easily. 
- [ ] **Admin APIs:** Manage lifecycle operations for a user's status (active/deactive) and manage the JWT tokens lifecycle to ensure users are authenticated before using your app. 

AuthCompanion ships without HTML Rendering, so you'll need to bring your own UI framework to make use of the feature APIs.

## Related Readings

- [The Ultimate Guide to handling JWTs on frontend clients](https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/)

## License

AuthCompanion is licensed under the [MIT](https://opensource.org/licenses/MIT) license.

## Contributions
Author: Paul Fischer [(Github)](https://github.com/pmprosociety), Teddy Schmitz [(Github)](https://github.com/Teddy-Schmitz)

Logo Design - Timothy Reeder [(Github)](https://github.com/tokonoma)
