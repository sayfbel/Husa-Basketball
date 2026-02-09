# HUSA Basketball Platform - HUSA

## Project Overview
Modern, premium, responsive web platform for HUSA Basketball, a Moroccan league basketball team.
Built with React, Vite, Node.js, Express, and MySQL.

## Structure
- `client/`: Frontend React application
- `server/`: Backend Node.js/Express application
- `database/`: SQL schema for the database
- `docs/`: Wireframes and documentation

## Tech Stack
- Frontend: React 18, Vite, React Router, CSS Variables, Glassmorphism
- Backend: Node.js, Express 5, MySQL
- Other: Chart.js, SheetJS, JWT, Multer, Nodemailer

## Getting Started

### Prerequisites
- Node.js
- MySQL Server

### Setup
1.  **Database**: Import `database/schema.sql` into your MySQL server.
2.  **Backend**:
    ```bash
    cd server
    npm install
    cp .env.example .env # Configure your ENV variables
    npm run dev
    ```
3.  **Frontend**:
    ```bash
    cd client
    npm install
    npm run dev
    ```

## Features
- Home, News, Club History
- Kids Reservation System
- Squad & Staff Management
- Training Center & Tryouts
- Fan Messages
- Admin Dashboard

## Deployment
- Frontend: Vercel / Netlify
- Backend: Railway / Render / Heroku
