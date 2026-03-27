const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());

// Enable CORS for your React frontend
app.use(cors({ origin: 'http://localhost:5173' }));

const JWT_SECRET = process.env.JWT_SECRET || 'EDCSC_SUPER_SECRET_2026';

// Database Configuration
const dbConfig = {
    user: 'sa',
    password: 'Abinet123', 
    server: '127.0.0.1',
    database: 'EduRegistrar',
    options: { 
        encrypt: false, 
        trustServerCertificate: true 
    }
};

// Create Connection Pool
const poolPromise = new sql.ConnectionPool(dbConfig).connect()
    .then(pool => { 
        console.log('✅ Connected to SQL Server: EduRegistrar'); 
        return pool; 
    })
    .catch(err => {
        console.error('❌ Database Connection Failed: ', err);
        process.exit(1);
    });

// --- JWT MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Access Denied" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Token Expired or Invalid" });
        req.user = user;
        next();
    });
};

// --- AUTHENTICATION ---
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
            res.status(401).json({ error: "Invalid email or password" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- DASHBOARD STATISTICS ---
app.get('/api/dashboard-stats', authenticateToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                (SELECT COUNT(*) FROM dbo.students) AS totalStudents,
                (SELECT COUNT(*) FROM dbo.staff) AS activeStaff,
                (SELECT COUNT(*) FROM dbo.enrollments) AS totalEnrollments,
                (SELECT COUNT(*) FROM dbo.courses) AS totalCourses
        `);
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- STUDENT MANAGEMENT ---
app.get('/api/students', authenticateToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT id, full_name, email, phone, [status] FROM dbo.students');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- COURSE MANAGEMENT ---
app.get('/api/courses', authenticateToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM dbo.courses');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ATTENDANCE SYSTEM ---

// 1. Get active enrollments for the "Mark Attendance" dropdown
app.get('/api/enrollments/active', authenticateToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT e.id, s.full_name, c.course_name, e.course_id 
            FROM dbo.enrollments e
            JOIN dbo.students s ON e.student_id = s.id
            JOIN dbo.courses c ON e.course_id = c.id
            WHERE e.status = 'active'
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Get attendance history for a specific course
app.get('/api/attendance', authenticateToken, async (req, res) => {
    const { courseId } = req.query;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('courseId', sql.Int, courseId)
            .query(`
                SELECT a.*, s.full_name, p.full_name as marked_by_name 
                FROM dbo.attendance a
                JOIN dbo.enrollments e ON a.enrollment_id = e.id
                JOIN dbo.students s ON e.student_id = s.id
                LEFT JOIN dbo.profiles p ON a.marked_by = p.id
                WHERE e.course_id = @courseId
                ORDER BY a.[date] DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Save new attendance records (Supports single or bulk)
app.post('/api/attendance', authenticateToken, async (req, res) => {
    const records = Array.isArray(req.body) ? req.body : [req.body];
    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            for (const record of records) {
                await transaction.request()
                    .input('enrollment_id', sql.Int, record.enrollment_id)
                    .input('date', sql.Date, record.date)
                    .input('status', sql.NVarChar, record.status)
                    .input('notes', sql.NVarChar, record.notes || '')
                    .input('marked_by', sql.Int, record.marked_by)
                    .query(`
                        INSERT INTO dbo.attendance (enrollment_id, [date], [status], notes, marked_by)
                        VALUES (@enrollment_id, @date, @status, @notes, @marked_by)
                    `);
            }
            await transaction.commit();
            res.json({ success: true, message: "Attendance recorded successfully" });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- HEALTH CHECK ---
app.get('/', (req, res) => {
    res.send('Registrar API is running perfectly! 🚀');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Production Server running at: http://localhost:${PORT}`);
});