# Password Reset Flow Application

## Project Overview

This project implements a complete password reset flow for a web application with email verification, token expiry, and secure password update. The backend is built with Node.js, Express, and MongoDB, while the frontend uses React with Bootstrap for responsive UI.

---

## Features

- Responsive UI built with Bootstrap and React
- Secure password reset using cryptographically strong tokens
- Email verification with a styled HTML email containing reset link
- Token expiry after 1 hour for security
- Password strength validation (minimum 8 chars, uppercase, lowercase, number, special character)
- Clear user feedback on success or error states
- Proper error handling and input validation on frontend and backend

---

## Prerequisites

- Node.js (v16 or newer recommended)
- npm (comes with Node.js)
- MongoDB database instance (local or cloud)
- SMTP email account credentials (for sending reset emails)
- Git (optional, for cloning repo)

---

## Installation Instructions

### Backend Setup

1. Clone the repository or download the source code.

2. Navigate to the backend root directory:
   
       cd password-reset-backend

3. Install dependencies:
   
       npm install

4. Create a `.env` file in the root directory by copying `.env.example` and filling in your values:
   
       cp .env.example .env

   Edit `.env` and provide valid values for:

   - `MONGO_URI` - your MongoDB connection string
   - `PORT` - port number for backend server (default 5000)
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - your SMTP email server credentials
   - `FRONTEND_URL` - frontend base URL (e.g., http://localhost:3000)

5. Start the backend server in development mode with live reload:
   
       npm run dev

   Or start production mode:
   
       npm start

6. Backend server runs on `http://localhost:5000` by default.

---

### Frontend Setup

1. Change to the frontend directory:
   
       cd client

2. Install dependencies:
   
       npm install

3. Create a `.env` file in `client` folder (optional) to override backend URL if needed:

       REACT_APP_BACKEND_URL=http://localhost:5000/api/auth

4. Start the React development server:
   
       npm start

5. The frontend app runs on `http://localhost:3000` by default.

---

## Configuration Instructions

### Environment Variables (Backend)

- `MONGO_URI`: MongoDB connection string (URI)
- `PORT`: Port for backend server (default 5000)
- `SMTP_HOST`: SMTP server host (e.g., smtp.gmail.com)
- `SMTP_PORT`: SMTP server port (e.g., 587 or 465)
- `SMTP_USER`: SMTP username (email address)
- `SMTP_PASS`: SMTP password or app-specific password
- `FRONTEND_URL`: Base URL of frontend app (used to generate reset links)
- `JWT_SECRET`: Optional secret for JWT or other secure operations

### Environment Variables (Frontend)

- `REACT_APP_BACKEND_URL`: Base URL for backend API (e.g., `http://localhost:5000/api/auth`)

---

## How to Run the Application Locally

1. Start backend server (`npm run dev` in backend folder)

2. Start frontend server (`npm start` in client folder)

3. Open browser and navigate to `http://localhost:3000/forgot-password` to test the flow

---

## Usage Examples

### Forgot Password

- Enter your registered email and submit
- If email exists, you will receive a reset link via email (check spam folder)
- If email not found, an error is shown

### Reset Password

- Click the reset link in your email
- If token is valid and not expired, you will be prompted to enter a new password
- Enter a strong new password and confirm it
- On success, password is updated and you can login
- If token is invalid or expired, an error message is shown with option to request reset again

---

## Troubleshooting Common Issues

- **No reset email received:** Check spam folder, verify SMTP credentials, and ensure `FRONTEND_URL` is correct.
- **Backend connection errors:** Verify `MONGO_URI` and MongoDB server availability.
- **Frontend API errors:** Confirm `REACT_APP_BACKEND_URL` points to correct backend endpoint.
- **Token expired errors:** Reset tokens expire after 1 hour for security; request a new reset if expired.
- **Password validation errors:** Ensure new password meets all criteria: min 8 chars, uppercase, lowercase, number, special char.

---

## Project Structure Explanation

