# EventHub — Online Event Discovery & Registration Platform

EventHub is a full-stack web application designed to help users discover upcoming events, view event details, register for events, and manage their registrations.

The platform also provides an admin dashboard where administrators can create, update, delete, and manage events and view user registrations.

---

## 📌 Project Overview

EventHub provides a simple and user-friendly platform for online event discovery and registration.

Users can:

- Create an account
- Login securely
- Browse upcoming events
- View complete event details
- Register for events
- View their registered events

Administrators can:

- Login through the admin portal
- View dashboard statistics
- Create new events
- Edit existing events
- Delete events
- View all user registrations

---

## 🎯 Project Objectives

The main objectives of EventHub are:

1. Provide an easy platform for discovering upcoming events.
2. Allow users to register for events online.
3. Provide secure user authentication.
4. Provide role-based access for administrators.
5. Allow administrators to manage events efficiently.
6. Store users, events, and registrations in a database.
7. Provide REST API-based communication between frontend and backend.

---

## ✨ Features

### 👤 User Features

- User Registration
- User Login
- Password Validation
- JWT Authentication
- Browse Upcoming Events
- Event Details Page
- Event Registration
- My Registrations
- Logout
- Responsive User Interface

### 🔐 Admin Features

- Separate Admin Login
- Admin Authentication
- Dashboard Statistics
- Create Events
- Edit Events
- Delete Events
- Manage Events
- View All Registrations
- Role-Based Access Control

---

## 🛠️ Technologies Used

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Node.js
- Express.js

### Database

- SQLite
- better-sqlite3

### Authentication & Security

- JWT (JSON Web Token)
- bcryptjs

### Other Technologies

- CORS
- Nodemon

---

## 📂 Project Structure

```text
EventHub
│
├── backend
│   ├── database.js
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   └── eventhub.db
│
├── frontend
│   ├── admin-login.html
│   ├── admin.html
│   ├── auth.js
│   ├── event.html
│   ├── index.html
│   ├── login.html
│   ├── registrations.html
│   ├── script.js
│   ├── signup.html
│   └── style.css
│
└── README.md