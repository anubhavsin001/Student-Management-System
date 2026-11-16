# Student CRUD application

A Spring Boot application with a React frontend for managing student records.

## Requirements

- Java 21 or later
- Node.js and npm
- MySQL with a `demo` database

## Database configuration

The application connects to `jdbc:mysql://localhost:3306/demo` as `root` by
default. Set `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` in the environment to
override these settings. `.env.example` lists the variable names; Spring Boot
does not load `.env` files automatically. Do not commit credentials or local
database files.

## Run locally

Start the backend from the project root:

```powershell
.\mvnw.cmd spring-boot:run
```

In a second terminal, start the React frontend:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`).
The frontend proxies API calls to the backend at `http://localhost:8081`.

To build the frontend for Spring Boot to serve:

```powershell
cd frontend
npm run build
```
