const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const roleRoutes = require("./routes/roleRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const courseRoutes = require("./routes/courseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const openapiDocument = require("./docs/openapi");
const pool = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// =========================
// Swagger API Documentation
// =========================

app.get("/docs/openapi.json", (req, res) => {
res.json(openapiDocument);
});

app.use(
"/docs",
swaggerUi.serve,
swaggerUi.setup(openapiDocument)
);

// =========================
// Health Check
// =========================

app.get("/", (req, res) => {
res.json({
success: true,
message: "EduCore LMS Backend is running."
});
});

// =========================
// Database Test
// =========================

app.get("/test-db", async (req, res) => {
try {
const result = await pool.query("SELECT NOW()");

```
res.json({
  success: true,
  time: result.rows[0]
});
```

} catch (err) {
console.error("Database error:", err);

```
res.status(500).json({
  success: false,
  error: err.message
});
```

}
});

// =========================
// API Routes
// =========================

app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/assignments", assignmentRoutes);

// =========================
// 404 Handler
// =========================

app.use((req, res) => {
res.status(404).json({
success: false,
message: "Route not found."
});
});

// =========================
// Vercel / Server Export
// =========================

module.exports = app;

// Local development
if (require.main === module) {
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
console.log(`Server running on http://localhost:${PORT}`);
console.log(`Swagger docs: http://localhost:${PORT}/docs/`);
});
}
