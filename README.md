<div align="center">
  <h1>🛫 Airline Backend Architecture: API Gateway & Auth Service</h1>
  <p><strong>A Highly Scalable, Secure, and Centralized API Gateway engineered for a Distributed Microservices Ecosystem.</strong></p>
</div>

---

## 📖 Project Overview

This service operates as the **API Gateway and Centralized Identity Provider** for a comprehensive Airline Management System. In a distributed microservices environment (e.g., Flight Search Service, Booking Service), exposing individual services directly to the client creates tight coupling and severe security vulnerabilities. 

This project solves this by acting as a **single entry point**. It intelligently proxies requests, enforces strict **Rate Limiting**, orchestrates **JWT-based Authentication**, and handles **Role-Based Access Control (RBAC)**. By abstracting the complex backend topology, it ensures that downstream services remain secure, isolated, and solely focused on their specific business capabilities.

---

## 🛠️ Complete Technology Stack

**Core Frameworks & Runtimes:**
* **Node.js** - High-performance, event-driven JavaScript runtime.
* **Express.js** - Minimalist and extensible backend framework.

**Database & ORM:**
* **MySQL 2** - Highly reliable relational database management system.
* **Sequelize ORM** - Promise-based Node.js ORM used for strict schema definitions, associations, and queries.
* **Sequelize CLI** - Employed for declarative database migrations and seeders, ensuring deterministic setups.

**Security, Authentication & Proxying:**
* **JWT (JSON Web Tokens)** - For stateless, cryptographically secure user sessions.
* **Bcrypt** - State-of-the-art password hashing with salt generation.
* **http-proxy-middleware** - High-performance HTTP proxying to seamlessly forward requests to microservices.
* **express-rate-limit** - DDoS protection and API throttling.

**Observability & Tools:**
* **Winston** - Asynchronous, structured logging for detailed telemetry.
* **Dotenv** - Environment variable management for 12-factor app compliance.

---

## 🚀 Engineering Problems Solved

This project successfully tackles crucial distributed systems and software engineering challenges, making it robust and production-ready:

### 1. Centralized Microservices Routing (API Gateway Pattern)
* **The Challenge:** Clients securely communicating with multiple decentralized microservices without exposing internal network IP addresses or ports.
* **The Solution:** Engineered a robust **API Gateway** acting as a reverse proxy using `http-proxy-middleware`. It parses incoming requests and rewrites paths (e.g., stripping `/flightService`), dynamically forwarding them to the correct downstream nodes. It unifies cross-origin handling and abstracts backend topology entirely.

### 2. Distributed Authentication & Role-Based Access Control (RBAC)
* **The Challenge:** Duplicating authentication logic across every single microservice leads to massive code redundancy and security loopholes.
* **The Solution:** Extracted identity management directly into the edge (this gateway). Built a secure **JWT-based authentication** flow. Designed a complete **RBAC** system via custom middlewares (verifying `Admin` or `FlightCompany` roles). Unauthorized or under-privileged requests are intercepted and terminated **before** reaching downstream services, saving bandwidth and computing power. 

### 3. Smart Route Protection & API Design
* **The Challenge:** Differentiating between public read operations (e.g., searching flights) and protected write operations (e.g., creating a flight segment) on the same endpoint.
* **The Solution:** Configured dynamic proxy middlewares that intelligently evaluate HTTP methods. `GET` requests flow directly to downstream microservices uninterrupted, whereas `POST`, `PUT`, and `DELETE` requests are inherently paused and routed through the Authentication/Authorization pipeline before proxying.

### 4. API Security & Traffic Control (Rate Limiting)
* **The Challenge:** Protecting APIs from brute-force login attempts, DDoS attacks, and resource abuse.
* **The Solution:** Configured `express-rate-limit` to establish strict traffic policies (e.g., a limit of 30 requests per 2 minutes per IP). This shields internal microservices from volumetric attacks, ensuring high availability (HA).

### 5. Deterministic Database Schema Versioning
* **The Challenge:** Reliably tracking DB changes, creating Many-to-Many entity relationships (Users ↔ Roles), and safely propagating schemas across staging and production.
* **The Solution:** Leveraged **Sequelize Migrations and Seeders**. This provides reliable version control for the database, ACID-compliant structure creation, and a reproducible state for CI/CD deployments. The platform maps complex constraints efficiently via junction tables (`user_roles`).

### 6. Architectural Maintainability via Separation of Concerns
* **The Challenge:** High coupling between transport (HTTP) layers, business logic, and database mapping leads to unmaintainable spaghetti code.
* **The Solution:** Architected a structurally sound Layered Architecture isolating concerns: **Routes ➡️ Middlewares ➡️ Controllers ➡️ Services ➡️ Repositories**. This guarantees persistence ignorance in the business layer, achieving a highly testable and loosely coupled codebase.

---

## 🏗️ Request Flow Diagram

1. **Client Request** ➡️ Reaches Gateway on a unified port.
2. **Rate Limiter** ➡️ Checks if IP has exceeded request limits. Drops if violated.
3. **Gateway Router** ➡️ Matches the URI prefix (e.g., `/flightService` or `/bookingService`).
4. **Auth Middleware** ➡️ Extracts JWT. If the method requires auth (e.g., `POST`), token is verified.
5. **RBAC Control** ➡️ Validates if the authenticated identity possesses the necessary roles.
6. **Reverse Proxy** ➡️ Rewrites the URL and streams the request securely to the internal microservice.

---

## 📁 System Architecture inside `src/`

* **`config/`**: Setup files for external libraries. (e.g., robust `winston` loggers, `dotenv` bindings).
* **`routes/`**: URI endpoints binding incoming HTTP configurations to their specific controllers/proxies.
* **`middlewares/`**: Request interceptors containing business-agnostic validators and authenticators.
* **`controllers/`**: HTTP request/response handlers. Responsible for mapping data payloads into service calls and returning unified JSON architectures.
* **`services/`**: The core Business Logic layer. Orchestrates data operations flawlessly.
* **`repositories/`**: The Data Access layer. Isolates ORM queries and SQL commands so domain logic remains DB-agnostic. Contains reusable `crud-repository` logic.
* **`models/`, `migrations/`, `seeders/`**: Sequelize entities controlling the `Users` and `Roles` database lifecycle mapping.
* **`utils/`**: Application-wide helpers containing standard `AppError` exception handlers and centralized success/error response formatting.

---

## ⚙️ Local Development Setup

To test and run this gateway locally, follow these steps:

### 1. Clone & Install dependencies
```bash
git clone <your-repository-url>
cd airline-api-gateway
npm install
```

### 2. Environment Variables configuration
Create a `.env` file in the root directory and define the configuration:
```env
PORT=3000
JWT_SECRET=your_super_secret_jwt_signature_key
JWT_EXPIRY=1d
FLIGHT_SERVICE=http://localhost:4000
BOOKING_SERVICE=http://localhost:5000
```

### 3. Database Initialization & Setup
_Ensure you modify `src/config/config.json` with your active MySQL credentials before proceeding._
```bash
# Create the relational database
npx sequelize db:create

# Run all migrations (Users, Roles, User_Roles)
npx sequelize db:migrate

# Populate initial standard data (Roles)
npx sequelize db:seed:all
```

### 4. Boot the Server
```bash
npm run dev
```