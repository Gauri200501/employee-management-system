# Employee Management System

A full-stack employee management application with a public workforce dashboard and authenticated employee-management tools.

## Features

- Public dashboard with aggregate workforce statistics, department and role distributions, and employee status summaries.
- Protected employee directory and employee profile pages.
- Employee creation, editing, and deletion with role-based authorization.
- Employee search and filtering.
- Responsive interface with a dark, high-contrast design.
- JWT-based API authentication.

> The frontend login page has been removed. The dashboard is available without signing in, but employee records and management pages still require a valid JWT. The backend login endpoint remains available to issue tokens.

## Tech stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, Vite, React Router, Recharts, Axios |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose |
| Authentication | JWT and bcryptjs |

## Requirements

- Node.js 18 or later
- npm
- A running MongoDB instance, local or hosted

## Getting started

Clone the repository and install the frontend and backend dependencies:

```bash
git clone https://github.com/Gauri200501/employee-management-system.git
cd employee-management-system
npm --prefix backend install
npm --prefix frontend install
```

### Configure the backend

Create `backend/.env` (you can copy `backend/.env.example`) and set the MongoDB connection string and a unique JWT secret:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/employeehub_db
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace-with-a-unique-strong-password
NODE_ENV=development
```

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` to the initial administrator credentials you choose. If both are set, the backend creates that account on first startup if it does not already exist. These values and the JWT secret must be unique and secure before exposing the service.

Start the API:

```bash
npm --prefix backend run dev
```

The API listens on `http://localhost:5000` by default.

### Configure and start the frontend

Create `frontend/.env` from `frontend/.env.example`. The example points to the local API:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend in a second terminal:

```bash
npm --prefix frontend run dev
```

Vite prints the local URL, usually `http://localhost:5173`.

## Authentication and access

- `/` and `/login` redirect to the public dashboard.
- `GET /api/employees/stats` returns aggregate dashboard statistics without employee records.
- Employee listings, profiles, and mutations require a valid bearer token.
- Creating employees requires the Admin or HR role; deleting employees requires the Admin role.
- The frontend does not currently provide a login form. Obtain a token through the backend login API or another approved authentication flow before using employee-management pages.

## API overview

All API paths are relative to `/api`.

### Authentication

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/login` | Public | Authenticate and receive a JWT |
| `GET` | `/auth/me` | Authenticated | Get the current employee |

### Employees

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/employees/stats` | Public | Aggregate dashboard statistics only |
| `GET` | `/employees` | Authenticated | List employees |
| `GET` | `/employees/:id` | Authenticated | Get an employee profile |
| `POST` | `/employees` | Admin or HR | Create an employee |
| `PUT` | `/employees/:id` | Authenticated | Update an employee |
| `DELETE` | `/employees/:id` | Admin | Delete an employee |

### Health

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | Check API health |

Include the JWT as a bearer credential in the `Authorization` header on protected requests.

## Project structure

```text
employee-management-system/
├── backend/
│   ├── config/          # MongoDB connection
│   ├── controllers/     # API handlers
│   ├── middleware/      # Authentication and error handling
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/   # Reusable UI components
    │   ├── pages/        # Dashboard and employee pages
    │   └── services/     # API client
    └── vite.config.js
```

## Available scripts

Run these commands from the corresponding project directory:

| Directory | Command | Description |
| --- | --- | --- |
| `backend` | `npm run dev` | Start the API with Nodemon |
| `backend` | `npm start` | Start the API |
| `frontend` | `npm run dev` | Start the Vite development server |
| `frontend` | `npm run build` | Create a production build |
| `frontend` | `npm run lint` | Run Oxlint |
| `frontend` | `npm run preview` | Preview the production build |
