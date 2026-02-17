# HUSA Basketball Platform - Elite Command Center

## Project Overview
A premium, cinematic, and tactical web-operations platform for **HUSA Basketball**, a major Moroccan league basketball team. This platform transforms traditional team management into a high-performance "Command Center" experience.

Built with a modern stack focusing on rich aesthetics, glassmorphism, and tactical data processing.

## 🚀 Core Features
- **Combat Intel Dashboard**: Re-imagined Coach/Player dashboards with an elite, industrial-tactical aesthetic.
- **Match Sheet OCR Scanner**: Integrated AI (Tesseract.js) to extract match data, rosters, and scores directly from physical match sheet images.
- **Tactical Dossier System**: Advanced reporting tool for coaches with automated data uplink and manual mission logging.
- **Squad Command**: Explicit position-based player assignment (Positions 1-5) and system management.
- **Interactive Tactical Board**: Digital workspace for designing and simulating game plays.
- **Public Operations**: News, History, Club Statistics, and Kids Reservation system.

## 🛠 Tech Stack
- **Frontend**: React 18 (Hooks), Vite, React Router, CSS Variables (Custom Design System).
- **Intelligence Engine**: Tesseract.js (AI OCR Pipeline).
- **Backend**: Node.js, Express 5, MySQL.
- **Analytics & Icons**: Chart.js, Lucide-React.
- **Data Handling**: Axios, SheetJS (XLSX), Multer, Nodemailer.

## 📦 Required Libraries
To run the project, ensure the following core libraries are installed:

### Frontend (client)
```bash
npm install tesseract.js lucide-react axios chart.js react-chartjs-2 react-router-dom
```

### Backend (server)
```bash
npm install express mysql2 dotenv cors multer nodemailer jsonwebtoken bcryptjs
```

## 🏗 Setup & Installation

### 1. Database Configuration
- Create a MySQL database.
- Import the schema from `database/schema.sql`.

### 2. Backend Initialization
```bash
cd server
npm install
# Configure .env based on .env.example
npm run dev
```

### 3. Frontend Initialization
```bash
cd client
npm install
npm run dev
```

## 🔐 Clearance & Security
- **Role-Based Access Control**: Protected routes for Coaches, Players, and Presidency.
- **Tactical Encryption**: Sophisticated UI layers simulating military-grade dossiers.

## 🌐 Deployment
- **Frontend**: Optimized for Vercel/Netlify.
- **Backend & DB**: Optimized for Railway/Render.

---
*Created by the HUSA Operations Tech Team.*
