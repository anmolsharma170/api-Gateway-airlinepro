# Airline API Gateway & Authentication Service

This is the central API Gateway for the Airline backend microservices system. It handles core cross-cutting concerns including secure authentication, authorization (RBAC), intelligent request routing, and rate-limiting.

## 🚀 Engineering Problems Solved

This project successfully addresses several crucial distributed systems challenges, making it highly robust and production-ready.

### 1. Centralized Microservices Routing (API Gateway Pattern)
* **Challenge:** Clients securely accessing and communicating with multiple decentralized microservices without exposing internal network topology.
* **Solution:** Implemented a robust **API Gateway** acting as a single entry point using `http-proxy-middleware`. It effectively abstracts the internal service architecture, orchestrates upstream proxying, reduces client-side complexity, and unifies cross-origin handling.

### 2. Distributed Authentication & Role-Based Access Control (RBAC)
* **Challenge:** Duplicating authentication logic across microservices leads to security vulnerabilities and code redundancy.
* **Solution:** Extracted identity management directly into the gateway. Engineered a secure **JWT-based authentication** flow with `bcrypt` password hashing. Designed a complete **Role-Based Access Control (RBAC)** system via custom middlewares, ensuring that unauthorized or under-privileged requests are intercepted and terminated before reaching downstream microservices.

### 3. API Security & Traffic Control (Rate Limiting)
* **Challenge:** Protecting public-facing APIs from brute-force attempts, DDoS attacks, and API abuse.
* **Solution:** Configured and integrated `express-rate-limit` to establish strict traffic policies and IP-based throttling. This highly reduces the risk of volumetric attacks and ensures the resilience and high availability of backend services.

### 4. Maintainability via Clean Layered Architecture
* **Challenge:** High coupling between database logic, business rules, and API transport layers.
* **Solution:** Architected a structurally sound, modular application separating concerns into distinct layers: **Controllers, Services, and Repositories**. This guarantees persistence ignorance in the business layer, achieving a highly testable, cohesive, and easily scalable codebase.

### 5. Deterministic Database Schema Versioning
* **Challenge:** Reliably tracking database state changes and safely propagating schema migrations across multiple operational environments.
* **Solution:** Integrated **Sequelize ORM** alongside a robust migration and seeder pipeline. This provides reliable database version control, ACID-compliant transactions, and a reproducible database state for robust CI/CD deployments.

---

## 🏗️ Project Structure

src -> Inside the src folder all the actual source code regarding the project will reside.

Lets take a look inside the src folder

config -> In this folder anything and everything regarding any configurations or setup of a library or module will be done. For example: setting up dotenv so that we can use the environment variables anywhere in a cleaner fashion, this is done in the server-config.js. One more example can be to setup you logging library that can help you to prepare meaningful logs, so configuration for this library should also be done here.

routes -> In the routes folder, we register a route and the corresponding middleware and controllers to it.

middlewares -> they are just going to intercept the incoming requests where we can write our validators, authenticators etc.

controllers -> they are kind of the last middlewares as post them you call you business layer to execute the business logic. In controllers we just receive the incoming requests and data and then pass it to the business layer, and once business layer returns an output, we structure the API response in controllers and send the output.

repositories -> this folder contains all the logic using which we interact the DB by writing queries, all the raw queries or ORM queries will go here.

services -> contains the buiness logic and interacts with repositories for data from the database

utils -> contains helper methods, error classes etc.

Setup the project
Download this template from github and open it in your favourite text editor.
Go inside the folder path and execute the following command:
npm install
In the root directory create a .env file and add the following env variables

    PORT=<port number of your choice>
ex:

    PORT=3000
go inside the src folder and execute the following command:

  npx sequelize init
By executing the above command you will get migrations and seeders folder along with a config.json inside the config folder.

If you're setting up your development environment, then write the username of your db, password of your db and in dialect mention whatever db you are using for ex: mysql, mariadb etc

If you're setting up test or prod environment, make sure you also replace the host with the hosted db url.

To run the server execute

npm run dev