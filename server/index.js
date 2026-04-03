const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'EDCSC_TACTICAL_SECURE_2026';

app.use(express.json());

// CORS
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ====================== JWT AUTH MIDDLEWARE ======================
// Define this FIRST before using it in routes
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Access Denied: Missing Token" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Access Revoked: Token Expired or Invalid" });
        }
        req.user = user;
        next();
    });
};

// ====================== DATABASE CONFIG ======================
const dbConfig = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'Abinet123',
    server: process.env.DB_SERVER || '127.0.0.1',
    database: process.env.DB_NAME || 'EduRegistrar',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    },
    pool: {
        max: 15,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

const poolPromise = new sql.ConnectionPool(dbConfig).connect()
    .then(pool => {
        console.log('✅ SQL SERVER HANDSHAKE: STABLE [EduRegistrar]');
        return pool;
    })
    .catch(err => {
        console.error('❌ CRITICAL DATABASE FAILURE:', err.message);
        process.exit(1);
    });

// ====================== RESPONSE WRAPPER MIDDLEWARE ======================
app.use((req, res, next) => {
    const originalJson = res.json;
    res.json = function (data) {
        const enhancedResponse = {
            metadata: {
                server_timestamp: new Date().toISOString(),
                transaction_id: `EDCSC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                connection_status: "STABLE"
            },
            payload: data
        };
        originalJson.call(this, enhancedResponse);
    };
    next();
});

// ====================== API ROUTES ======================

// LOGIN (No auth required)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, password)
            .query('SELECT id, full_name, email, role FROM dbo.profiles WHERE email = @email AND [Password] = @password');

        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
            res.json({ success: true, token, user });
        } else {
            res.status(401).json({ error: "Credential Verification Failed" });
        }
    } catch (err) {
        res.status(500).json({ error: "INTERNAL_SQL_ERROR: " + err.message });
    }
});

// COURSES
app.get('/api/courses', authenticateToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM dbo.courses');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: "Courses table error: " + err.message });
    }
});

// STUDENTS
app.get('/api/students', authenticateToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT id, StudentID, FullName, Email, Phone, Status FROM dbo.students');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: "Students table error: " + err.message });
    }
});

// STAFF
app.get('/api/staff', authenticateToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM dbo.staff');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: "Staff table error: " + err.message });
    }
});

// ENROLLMENTS
app.get('/api/enrollments', authenticateToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT e.*, s.FullName as student_name, c.course_name 
            FROM dbo.enrollments e
            LEFT JOIN dbo.students s ON e.student_id = s.id
            LEFT JOIN dbo.courses c ON e.course_id = c.id
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: "Enrollment error: " + err.message });
    }
});

// HEALTH CHECK
app.get('/', (req, res) => {
    res.send('🚀 EDCSC Command API: ONLINE');
});

app.listen(PORT, () => {
    console.log(`🚀 EDCSC Sector Node Running: http://localhost:${PORT}`);
});