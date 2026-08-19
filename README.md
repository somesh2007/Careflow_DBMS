# CareFlow — Hospital Management System

A full-stack Hospital Management System built with:
- **Frontend**: Vanilla HTML + CSS + JavaScript
- **Backend**: Node.js + Express
- **Database**: MySQL

---

## 📁 Project Structure

```
careflow/
├── database.sql              ← MySQL schema + sample data
├── backend/
│   ├── server.js             ← Express entry point
│   ├── db.js                 ← MySQL connection pool
│   ├── .env                  ← DB config (edit this!)
│   ├── middleware/
│   │   └── auth.js           ← Session auth guard
│   └── routes/
│       ├── auth.js           ← Login / logout / me
│       ├── doctors.js        ← Doctors CRUD
│       ├── patients.js       ← Patients CRUD
│       ├── appointments.js   ← Appointments CRUD + JOIN
│       └── dashboard.js      ← Aggregate queries
└── frontend/
    ├── index.html            ← Login page
    ├── css/style.css         ← All styles
    ├── js/
    │   ├── common.js         ← API helper, toast, auth guard
    │   ├── login.js
    │   ├── dashboard.js
    │   ├── doctors.js
    │   ├── patients.js
    │   └── appointments.js
    └── pages/
        ├── dashboard.html
        ├── doctors.html
        ├── patients.html
        └── appointments.html
```

---

## 🚀 Setup Instructions

### 1. Database Setup

Open MySQL Workbench or the MySQL CLI and run:

```sql
source /path/to/careflow/database.sql
```

This creates the `careflow` database with tables and sample data.

### 2. Configure Environment

Edit `backend/.env`:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=careflow
SESSION_SECRET=any_random_string
PORT=3000
```

### 3. Install Dependencies & Run

```bash
cd backend
npm install
node server.js
```

### 4. Open in Browser

Go to: **http://localhost:3000**

Login with:
- Username: `admin`
- Password: `admin123`

---

## 🔑 Features

| Module | Features |
|---|---|
| Login | Session-based admin authentication |
| Dashboard | Metric cards, bar chart, recent appointments |
| Doctors | Add / Edit / Delete / Search with live filtering |
| Patients | Add / Edit / Delete / Search |
| Appointments | Schedule, view with JOIN (doctor + patient names), quick status update, cascade delete |

---

## 🛡️ Default Admin Password

The default admin password `admin123` is stored as a **bcrypt hash** in the database.

To change it, run this in Node.js:

```js
const bcrypt = require('bcryptjs');
console.log(await bcrypt.hash('your_new_password', 10));
```

Then update the hash in the `admins` table.

---

## 📝 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Check session |
| GET | /api/doctors | List / search doctors |
| POST | /api/doctors | Create doctor |
| PUT | /api/doctors/:id | Update doctor |
| DELETE | /api/doctors/:id | Delete doctor (cascades) |
| GET | /api/patients | List / search patients |
| POST | /api/patients | Create patient |
| PUT | /api/patients/:id | Update patient |
| DELETE | /api/patients/:id | Delete patient (cascades) |
| GET | /api/appointments | List all (with JOIN) |
| POST | /api/appointments | Schedule appointment |
| PUT | /api/appointments/:id | Update appointment |
| PATCH | /api/appointments/:id/status | Quick status update |
| DELETE | /api/appointments/:id | Delete appointment |
| GET | /api/dashboard/summary | Aggregated metrics |
