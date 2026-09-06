const dashboardRoutes = require("./routes/dashboardRoutes");
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerUiDist = require('swagger-ui-dist');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const assignmentRoutes = require("./routes/assignmentRoutes");
const roleRoutes = require('./routes/roleRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const courseRoutes = require('./routes/courseRoutes');
const openapiDocument = require('./docs/openapi');

const pool = require('./config/db');
const app = express();

app.use(cors());
app.use(express.json());
app.get('/docs/openapi.json', (req, res) => {
  res.json(openapiDocument);
});
app.use('/docs', express.static(swaggerUiDist.getAbsoluteFSPath(), { index: false }));
app.use('/docs', swaggerUi.setup(openapiDocument));

// Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'EduCore LMS Backend is running.' });
});

// Test DB connection
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/courses', courseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/assignments", assignmentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
