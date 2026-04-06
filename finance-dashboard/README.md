# 💹 Finance Dashboard

A full-stack finance dashboard system with **role-based access control**, built with **Spring Boot**, **H2/SQL**, **React.js**, and **JWT authentication**.

---

## 🏗️ Architecture Overview

```
finance-dashboard/
├── backend/                          ← Spring Boot 3.2 (Java 21)
│   ├── src/main/java/com/finance/dashboard/
│   │   ├── config/
│   │   │   ├── DataSeeder.java       ← Seeds default users + sample records
│   │   │   ├── OpenApiConfig.java    ← Swagger/OpenAPI setup
│   │   │   └── SecurityConfig.java  ← Spring Security + CORS + JWT filter
│   │   ├── controller/
│   │   │   ├── AuthController.java           ← POST /auth/login, /register
│   │   │   ├── DashboardController.java      ← GET /dashboard/summary
│   │   │   ├── FinancialRecordController.java ← /records CRUD
│   │   │   └── UserController.java           ← /users CRUD (ADMIN)
│   │   ├── dto/
│   │   │   ├── request/              ← Input DTOs with Bean Validation
│   │   │   └── response/             ← Output DTOs (no entity leakage)
│   │   ├── entity/
│   │   │   ├── FinancialRecord.java  ← JPA entity, soft-delete via deletedAt
│   │   │   ├── Role.java             ← VIEWER | ANALYST | ADMIN enum
│   │   │   ├── TransactionType.java  ← INCOME | EXPENSE enum
│   │   │   └── User.java             ← JPA entity, bcrypt password
│   │   ├── exception/
│   │   │   ├── GlobalExceptionHandler.java   ← @RestControllerAdvice
│   │   │   ├── ErrorResponse.java
│   │   │   ├── ResourceNotFoundException.java
│   │   │   └── ConflictException.java
│   │   ├── repository/
│   │   │   ├── FinancialRecordRepository.java ← JPQL filters + aggregation
│   │   │   └── UserRepository.java            ← Search + role queries
│   │   ├── security/
│   │   │   ├── JwtUtils.java                  ← Token generation + validation
│   │   │   ├── JwtAuthenticationFilter.java   ← Per-request JWT extraction
│   │   │   └── UserDetailsServiceImpl.java    ← Bridges JPA ↔ Spring Security
│   │   └── service/
│   │       ├── AuthService.java
│   │       ├── DashboardService.java          ← All analytics aggregation
│   │       ├── FinancialRecordService.java    ← Interface
│   │       ├── UserService.java               ← Interface
│   │       └── impl/
│   │           ├── FinancialRecordServiceImpl.java
│   │           └── UserServiceImpl.java
│   └── src/test/                     ← Integration tests (MockMvc)
│       └── controller/
│           ├── AuthControllerTest.java
│           └── FinancialRecordControllerTest.java
│
├── frontend/                         ← React 18 + Recharts
│   └── src/
│       ├── components/
│       │   ├── auth/ProtectedRoute.js        ← Role-gated route wrapper
│       │   ├── dashboard/StatCard.js         ← KPI card component
│       │   ├── layout/Sidebar.js             ← Navigation sidebar
│       │   ├── layout/Header.js              ← Top header bar
│       │   ├── layout/ToastContainer.js      ← Notification toasts
│       │   ├── records/RecordFormModal.js    ← Create/edit record modal
│       │   ├── records/DeleteConfirmModal.js ← Reusable confirm dialog
│       │   └── users/UserFormModal.js        ← Create/edit user modal
│       ├── context/AuthContext.js            ← Global auth state + JWT storage
│       ├── hooks/useToast.js                 ← Toast notification hook
│       ├── pages/
│       │   ├── LoginPage.js                  ← Login + register form
│       │   ├── DashboardPage.js              ← Charts + KPIs + activity
│       │   ├── RecordsPage.js                ← Paginated records table
│       │   └── UsersPage.js                  ← User management table
│       ├── services/
│       │   ├── api.js                        ← Axios instance + JWT interceptor
│       │   ├── authService.js
│       │   ├── dashboardService.js
│       │   ├── recordsService.js
│       │   └── usersService.js
│       └── utils/helpers.js                  ← formatCurrency, formatDate, etc.
│
└── docs/
    └── schema.sql                    ← SQL schema reference + access control matrix
```

---

## 🚀 Quick Start

### Prerequisites
- Java 21+
- Maven 3.8+
- Node.js 18+ and npm

---

### 1. Backend

```bash
cd backend
mvn spring-boot:run
```

The backend starts on **http://localhost:8080**

- **Swagger UI:** http://localhost:8080/api/swagger-ui.html
- **H2 Console:** http://localhost:8080/api/h2-console
  - JDBC URL: `jdbc:h2:file:./data/financedb`
  - Username: `sa` | Password: `finance123`

On first startup, `DataSeeder` automatically creates 3 demo users and 32 sample financial records.

---

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

The React app starts on **http://localhost:3000** and proxies API calls to `localhost:8080/api`.

---

### 3. Demo Login Credentials

| Email | Password | Role | Access |
|-------|----------|------|--------|
| `admin@finance.com` | `admin123` | **ADMIN** | Full access |
| `analyst@finance.com` | `analyst123` | **ANALYST** | Records + Analytics |
| `viewer@finance.com` | `viewer123` | **VIEWER** | Dashboard only |

---

## 🔐 Role-Based Access Control

### Role Hierarchy

```
ADMIN > ANALYST > VIEWER
```

| Feature | VIEWER | ANALYST | ADMIN |
|---------|--------|---------|-------|
| Dashboard summary | ✅ | ✅ | ✅ |
| View records | ❌ | ✅ | ✅ |
| Create/Edit/Delete records | ❌ | ❌ | ✅ |
| View user list | ❌ | ❌ | ✅ |
| Create/Edit/Delete users | ❌ | ❌ | ✅ |
| Toggle user status | ❌ | ❌ | ✅ |

### Implementation Layers

Access control is enforced at **two layers** for defence-in-depth:

1. **URL-level** in `SecurityConfig.java` — Spring Security matcher rules
2. **Method-level** via `@PreAuthorize("hasRole('ADMIN')")` on controller methods

---

## 📡 API Reference

### Authentication
```
POST /api/auth/login          Body: { email, password }
POST /api/auth/register       Body: { fullName, email, password, role }
```

### Dashboard (VIEWER+)
```
GET  /api/dashboard/summary   Returns: KPIs, trends, category totals, recent activity
```

### Financial Records (ANALYST+ read, ADMIN write)
```
GET    /api/records                 ?type=INCOME|EXPENSE&category=&fromDate=&toDate=&search=&page=0&size=10
GET    /api/records/{id}
POST   /api/records                 Body: { amount, type, category, transactionDate, notes }
PUT    /api/records/{id}            Body: same as POST
DELETE /api/records/{id}            Soft delete (sets deletedAt timestamp)
```

### Users (ADMIN only)
```
GET    /api/users                   ?search=&role=&page=0&size=10
GET    /api/users/{id}
POST   /api/users                   Body: { fullName, email, password, role }
PUT    /api/users/{id}              Body: partial update (any combination of fields)
PATCH  /api/users/{id}/toggle-status
DELETE /api/users/{id}
```

All protected endpoints require header:
```
Authorization: Bearer <jwt_token>
```

---

## 🗄️ Database Design

**Engine:** H2 embedded (file-backed, swappable to PostgreSQL/MySQL)

### Tables

**`users`**
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK | Auto-increment |
| full_name | VARCHAR(100) | |
| email | VARCHAR(150) | UNIQUE |
| password | VARCHAR(255) | bcrypt hash |
| role | VARCHAR(20) | VIEWER / ANALYST / ADMIN |
| active | BOOLEAN | Soft-disable flag |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**`financial_records`**
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK | Auto-increment |
| amount | DECIMAL(15,2) | BigDecimal — never float |
| type | VARCHAR(10) | INCOME / EXPENSE |
| category | VARCHAR(100) | |
| transaction_date | DATE | Day granularity |
| notes | VARCHAR(500) | Optional |
| deleted_at | TIMESTAMP | NULL = active (soft delete) |
| created_by | BIGINT FK | → users.id |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

---

## 🧪 Running Tests

```bash
cd backend
mvn test
```

Integration tests use an **in-memory H2** database (separate from dev DB) defined in `application-test.properties`. Tests cover:
- Auth: register, duplicate email, invalid input, login success/failure
- Records: role-based create/read/delete, validation

---

## 🔧 Configuration

**`application.properties`** — key settings:

```properties
# Change to PostgreSQL for production:
spring.datasource.url=jdbc:postgresql://localhost:5432/financedb
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect

# JWT expiry (default: 24 hours)
app.jwt.expiration-ms=86400000

# Change secret before deploying:
app.jwt.secret=YourSecretKeyHere_MustBe256BitsMinimum
```

---

## 📐 Design Decisions & Assumptions

### Assumptions
1. **Single role per user** — simpler model; a join-table for multi-role can be added if needed.
2. **INR currency** — frontend defaults to Indian Rupee formatting; trivially changed via `helpers.js`.
3. **Self-registration assigns VIEWER** — any role can be set at registration for this demo, but in production self-registration would be locked to VIEWER; admin promotes.
4. **Soft-delete only on records** — users are hard-deleted (no FK cascade issues since records store the user reference for audit). Records are soft-deleted so historical analytics remain accurate.
5. **No rate limiting** — omitted to keep the scope clean; `express-rate-limit` equivalent in Spring would be Bucket4j.

### Tradeoffs
| Decision | Chosen | Alternative | Reason |
|----------|--------|-------------|--------|
| Database | H2 file | PostgreSQL | Zero setup for assessment; swap is 3 config lines |
| Auth | JWT stateless | Sessions | Better for distributed/microservice future |
| Role storage | Single enum column | roles join table | Simpler; sufficient for 3 fixed roles |
| Money type | `BigDecimal` | `double` | Prevents floating-point rounding errors in financial data |
| Delete strategy | Soft delete (records) | Hard delete | Preserves audit trail + analytics integrity |
| Frontend state | Context API | Redux | Proportionate complexity for this app size |

---

## 🏅 Features Implemented

| Feature | Status |
|---------|--------|
| JWT Authentication | ✅ |
| Role-Based Access Control (3 roles) | ✅ |
| User CRUD + status toggle | ✅ |
| Financial Records CRUD | ✅ |
| Soft Delete | ✅ |
| Pagination | ✅ |
| Search + multi-filter | ✅ |
| Dashboard KPIs | ✅ |
| Monthly trend charts | ✅ |
| Category breakdown (pie chart) | ✅ |
| Recent activity feed | ✅ |
| Input validation + error responses | ✅ |
| Swagger/OpenAPI docs | ✅ |
| Integration tests | ✅ |
| Seed data | ✅ |
