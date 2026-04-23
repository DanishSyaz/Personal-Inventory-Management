# Inventoria Full-Stack App

A full-stack Personal Inventory Management application built with Java Spring Boot (backend) and vanilla HTML/CSS/JavaScript (frontend).

## Features

- User registration and login
- JSON Web Token (JWT) authentication
- CRUD operations for inventory items
- MongoDB data storage
- Search, sorting, and filtering support
- Image upload support
- Clean responsive UI
- Application logging

## Backend

### Requirements

- Java 17
- Maven
- MongoDB running locally on `mongodb://localhost:27017`

### Run backend

1. Open a terminal in `backend`
2. Run:
   ```bash
   mvn spring-boot:run
   ```

The backend will start on `http://localhost:8080`.

## Frontend

The frontend is a static single-page app.

### Open locally

1. Open `frontend/index.html` in your browser.
2. Or serve it with a static server, for example:
   ```bash
   npx serve frontend
   ```

### Backend API endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/items`
- `POST /api/items`
- `PUT /api/items/{itemId}`
- `DELETE /api/items/{itemId}`
- `POST /api/upload`

## Notes

- Make sure MongoDB is running before starting the backend.
- The app stores uploaded files in the `uploads/` directory.
- You can change the backend API base URL in `frontend/src/api.js`.
