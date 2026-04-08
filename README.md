# Smart Campus Operations Hub

A full-stack web application for managing campus facilities, bookings, maintenance incidents, and notifications. Built as part of IT3030 — Programming Application Frameworks (PAF) 2026.

## Team — Group WE-117-1.2

| Member | Student ID | Module |
|--------|-----------|--------|
| Darshikan | — | A: Facilities & Assets Catalogue |
| Darsika | — | B: Booking Management |
| Himansa | — | C: Maintenance & Incident Ticketing |
| **Thisara (SANDAPIUM W A T)** | **IT23616356** | **D: Notifications + E: Auth & Authorization** |

## Tech Stack

- **Backend:** Spring Boot 4.0.5, Java 21, Spring Security, OAuth2, JWT (jjwt 0.11.5)
- **Frontend:** React 18, Vite, Tailwind CSS 3, Lucide React icons
- **Database:** MySQL 8.4 (via Docker)
- **CI/CD:** GitHub Actions

## Prerequisites

- Java 21 (JDK)
- Node.js 20+
- Docker Desktop (for MySQL)
- Git

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_ORG/it3030-paf-2026-smart-campus-group-WE-117-1.2.git
cd it3030-paf-2026-smart-campus-group-WE-117-1.2
```

### 2. Start MySQL via Docker
```bash
docker run -d --name smart-campus-db -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=root123 \
  -e MYSQL_DATABASE=smart_campus \
  mysql:8.4
```

If the container already exists:
```bash
docker start smart-campus-db
```

### 3. Run the Backend
```bash
cd backend
./mvnw spring-boot:run
```
Backend starts at: http://localhost:8080

### 4. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend starts at: http://localhost:5173

### 5. Access the Application
- Landing Page: http://localhost:5173
- Login: http://localhost:5173/login
- Dashboard: http://localhost:5173/dashboard (after login)

## API Endpoints

### Authentication (Module E — Thisara)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register with email/password |
| POST | `/api/auth/login` | Login with email/password |
| GET | `/api/auth/me` | Get current user profile |
| GET | `/api/admin/users` | List all users (ADMIN only) |
| PATCH | `/api/admin/users/{id}/role` | Update user role (ADMIN only) |
| DELETE | `/api/admin/users/{id}` | Delete user (ADMIN only) |

### Notifications (Module D — Thisara)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get my notifications |
| GET | `/api/notifications/unread/count` | Get unread count |
| PATCH | `/api/notifications/{id}/read` | Mark as read |
| POST | `/api/notifications/read-all` | Mark all as read |
| DELETE | `/api/notifications/{id}` | Delete notification |
| POST | `/api/notifications/test/seed` | Seed 5 demo notifications |

### Google OAuth2
- Login URL: `http://localhost:8080/oauth2/authorization/google`
- Callback URL: `http://localhost:8080/login/oauth2/code/google`

## Demo Flow (Viva)

1. Start Docker MySQL + Backend + Frontend
2. Register a user via the signup page
3. Login → see dashboard with sidebar navigation
4. Open Postman → `POST /api/notifications/test/seed` with JWT in Authorization header
5. Refresh browser → notification bell shows 5 unread notifications
6. Click bell → dropdown shows notifications with mark-as-read functionality
7. (Optional) Google OAuth login if credentials are configured

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Deep Blue | #003049 | Primary, sidebar, headers |
| Warm Red | #D62828 | Danger, admin elements |
| Vibrant Orange | #F77F00 | Accent, active states |
| Golden Yellow | #FCBF49 | Highlights, badges |

## Project Structure

```
├── backend/
│   └── src/main/java/com/example/backend/
│       ├── controller/     # REST controllers
│       ├── model/          # JPA entities
│       ├── repository/     # Spring Data repos
│       ├── service/        # Business logic
│       ├── security/       # JWT, OAuth2, Security config
│       └── exception/      # Global error handling
├── frontend/
│   └── src/
│       ├── components/     # Reusable components (NotificationPanel)
│       ├── context/        # AuthContext
│       ├── pages/          # Landing, Login, Signup, Dashboard
│       └── services/       # API axios config
└── .github/workflows/      # CI/CD pipeline
```
