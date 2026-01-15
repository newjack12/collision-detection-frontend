# Collision Admin Frontend (Vue 3 + Vite)

A simple **admin web panel** for a vehicle collision-detection system.

This frontend is built with **Vue 3 + Vite + Element Plus**, and it connects to the backend REST API to:
- Admin login
- Manage users and families (groups)
- Query and visualize uploaded sensor data with **ECharts** (line chart + table)

---

## Tech Stack

- Vue 3
- Vite
- Element Plus (UI)
- Pinia (state)
- Vue Router
- Axios (HTTP)
- ECharts (charts)

---

## Pages / Routes

The app uses a protected layout route (`/`) that requires login:

- `/login` — Administrator Login
- `/dashboard` — Home / Intro
- `/users` — User management (CRUD + enable/disable + reset password)
- `/families` — Family management (create + view members)
- `/sensor` — Sensor data query + table + line chart

---

## Requirements

- Node.js (recommended 18+)
- npm

---

## Environment Variables

The frontend uses Vite environment variables.

### `.env.development`

```env
VITE_API_BASE_URL=http://localhost:8080/api
