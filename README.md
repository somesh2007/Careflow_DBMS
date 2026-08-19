# CareFlow — Hospital Management System

A full-stack Hospital Management System built with:
- **Frontend**: Vanilla HTML + CSS + JavaScript
- **Backend**: Node.js + Express
- **Database**: postgreSQL

---

## 📁 Project Structure

```
careflow/
├── database.sql              ← postgreSQL
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

