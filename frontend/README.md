# Student Directory frontend

The React app uses the Spring Boot student routes on port `8081`.

For local development, start the Spring Boot application and run:

```shell
npm install
npm run dev
```

Vite serves the frontend and proxies the student API routes to
`http://localhost:8081`. To build the frontend for Spring Boot, run:

```shell
npm run build
```

The production build is written to
`src/main/resources/static`, where Spring Boot serves it from the application.
