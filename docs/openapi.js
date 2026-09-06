const openapi = {
  openapi: "3.0.3",
  info: {
    title: "EduCore LMS API",
    version: "1.0.0",
    description: "Authentication, learning dashboard, assignments, notifications, certificates, and role-management APIs for EduCore LMS.",
  },
  servers: [{ url: "https://backend-lms-iota-gray.vercel.app", description: "Production server" }],
  tags: [
    { name: "System", description: "Service health and database checks" },
    { name: "Auth", description: "Registration, login, and current-user profile" },
    { name: "Dashboard", description: "Authenticated learner dashboard summary" },
    { name: "Assignments", description: "Assignment listing and submissions" },
    { name: "Notifications", description: "Authenticated user notifications" },
    { name: "Certificates", description: "Authenticated user certificates" },
    { name: "Roles", description: "Roles and privileged user management" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter the JWT returned by POST /api/auth/login.",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Request failed." },
          errors: { type: "array", items: { type: "string" } },
        },
        required: ["success"],
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          full_name: { type: "string", example: "Ayesha Khan" },
          email: { type: "string", format: "email", example: "ayesha@example.com" },
          role: { type: "string", example: "Student" },
          role_id: { type: "integer", example: 1 },
        },
        required: ["id", "full_name", "email"],
      },
      AuthUser: {
        allOf: [{ $ref: "#/components/schemas/User" }, { required: ["role"] }],
      },
      Assignment: {
        type: "object",
        properties: {
          id: { type: "integer", example: 3 },
          course_id: { type: "integer", example: 2 },
          title: { type: "string", example: "React Components" },
          description: { type: "string", nullable: true, example: "Build a reusable component." },
          due_date: { type: "string", format: "date-time", nullable: true },
          created_at: { type: "string", format: "date-time" },
        },
        required: ["id", "course_id", "title"],
      },
      Submission: {
        type: "object",
        properties: {
          id: { type: "integer", example: 7 },
          assignment_id: { type: "integer", example: 3 },
          student_id: { type: "integer", example: 1 },
          file_url: { type: "string", nullable: true, example: "https://example.com/work.pdf" },
          grade: { type: "number", nullable: true, example: 92.5 },
          submitted_at: { type: "string", format: "date-time" },
        },
      },
      Notification: {
        type: "object",
        properties: {
          id: { type: "integer", example: 4 },
          message: { type: "string", example: "Your assignment was graded." },
          is_read: { type: "boolean", example: false },
          created_at: { type: "string", format: "date-time" },
        },
        required: ["id", "message", "is_read", "created_at"],
      },
      Certificate: {
        type: "object",
        properties: {
          id: { type: "integer", example: 2 },
          issued_at: { type: "string", format: "date-time" },
          course_id: { type: "integer", nullable: true, example: 5 },
          course_title: { type: "string", nullable: true, example: "JavaScript Fundamentals" },
          student_name: { type: "string", example: "Ayesha Khan" },
        },
        required: ["id", "issued_at", "student_name"],
      },
      Role: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Student" },
        },
        required: ["id", "name"],
      },
      DashboardData: {
        type: "object",
        properties: {
          enrolledCourses: { type: "integer", example: 4 },
          pendingAssignments: { type: "integer", example: 2 },
          certificatesEarned: { type: "integer", example: 1 },
        },
        required: ["enrolledCourses", "pendingAssignments", "certificatesEarned"],
      },
    },
    responses: {
      Unauthorized: { description: "No token was provided or the token is invalid/expired.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      Forbidden: { description: "The authenticated user does not have permission.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      NotFound: { description: "The requested resource was not found.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      ServerError: { description: "The server could not complete the request.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
    },
  },
  paths: {
    "/": {
      get: {
        tags: ["System"], summary: "Health check", responses: {
          200: { description: "Backend is running.", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" } } } } } },
        },
      },
    },
    "/test-db": {
      get: {
        tags: ["System"], summary: "Test the database connection", responses: {
          200: { description: "Database connection succeeded." },
          500: { $ref: "#/components/responses/ServerError" },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"], summary: "Register a student account", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["full_name", "email", "password"], properties: { full_name: { type: "string", minLength: 2, example: "Ayesha Khan" }, email: { type: "string", format: "email", example: "ayesha@example.com" }, password: { type: "string", minLength: 6, format: "password", example: "secret123" } } } } } }, responses: {
          201: { description: "Account created.", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, user: { $ref: "#/components/schemas/User" } } } } } },
          400: { description: "Validation failed.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          409: { description: "Email is already registered.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          500: { $ref: "#/components/responses/ServerError" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"], summary: "Log in and receive a JWT", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["email", "password"], properties: { email: { type: "string", format: "email", example: "ayesha@example.com" }, password: { type: "string", format: "password", example: "secret123" } } } } } }, responses: {
          200: { description: "Login succeeded.", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, token: { type: "string" }, user: { $ref: "#/components/schemas/AuthUser" } } } } } },
          400: { description: "Validation failed.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          401: { description: "Invalid credentials.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          500: { $ref: "#/components/responses/ServerError" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"], summary: "Get the current user", security: [{ bearerAuth: [] }], responses: {
          200: { description: "Current user.", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, user: { $ref: "#/components/schemas/AuthUser" } } } } } },
          401: { $ref: "#/components/responses/Unauthorized" }, 404: { $ref: "#/components/responses/NotFound" }, 500: { $ref: "#/components/responses/ServerError" },
        },
      },
      put: {
        tags: ["Auth"], summary: "Update the current user's name and email", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["full_name", "email"], properties: { full_name: { type: "string", example: "Ayesha Khan" }, email: { type: "string", format: "email", example: "new@example.com" } } } } } }, responses: {
          200: { description: "Profile updated.", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, user: { $ref: "#/components/schemas/AuthUser" } } } } } },
          400: { description: "Required fields are missing." }, 401: { $ref: "#/components/responses/Unauthorized" }, 404: { $ref: "#/components/responses/NotFound" }, 409: { description: "Email is already in use." }, 500: { $ref: "#/components/responses/ServerError" },
        },
      },
    },
    "/api/dashboard": {
      get: {
        tags: ["Dashboard"], summary: "Get the current learner dashboard summary", security: [{ bearerAuth: [] }], responses: {
          200: { description: "Dashboard counts.", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/DashboardData" } } } } } },
          401: { $ref: "#/components/responses/Unauthorized" }, 500: { $ref: "#/components/responses/ServerError" },
        },
      },
    },
    "/api/assignments": {
      get: {
        tags: ["Assignments"], summary: "List assignments", security: [{ bearerAuth: [] }], responses: {
          200: { description: "Assignments ordered by due date.", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, assignments: { type: "array", items: { $ref: "#/components/schemas/Assignment" } } } } } } },
          401: { $ref: "#/components/responses/Unauthorized" }, 500: { $ref: "#/components/responses/ServerError" },
        },
      },
    },
    "/api/assignments/submit": {
      post: {
        tags: ["Assignments"], summary: "Submit an assignment for the authenticated student", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["assignment_id"], properties: { assignment_id: { type: "integer", example: 3 }, file_url: { type: "string", format: "uri", nullable: true, example: "https://example.com/work.pdf" } } } } } }, responses: {
          201: { description: "Assignment submitted.", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, submission: { $ref: "#/components/schemas/Submission" } } } } } },
          400: { description: "assignment_id is missing." }, 401: { $ref: "#/components/responses/Unauthorized" }, 500: { $ref: "#/components/responses/ServerError" },
        },
      },
    },
    "/api/notifications": {
      get: {
        tags: ["Notifications"], summary: "List notifications for the authenticated user", security: [{ bearerAuth: [] }], responses: {
          200: { description: "User notifications.", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, notifications: { type: "array", items: { $ref: "#/components/schemas/Notification" } } } } } } },
          401: { $ref: "#/components/responses/Unauthorized" }, 500: { $ref: "#/components/responses/ServerError" },
        },
      },
    },
    "/api/notifications/read-all": {
      patch: {
        tags: ["Notifications"], summary: "Mark all notifications as read", security: [{ bearerAuth: [] }], responses: {
          200: { description: "Notifications marked as read." }, 401: { $ref: "#/components/responses/Unauthorized" }, 500: { $ref: "#/components/responses/ServerError" },
        },
      },
    },
    "/api/notifications/{id}/read": {
      patch: {
        tags: ["Notifications"], summary: "Mark one notification as read", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 4 }], responses: {
          200: { description: "Notification marked as read.", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, notification: { $ref: "#/components/schemas/Notification" } } } } } },
          401: { $ref: "#/components/responses/Unauthorized" }, 404: { $ref: "#/components/responses/NotFound" }, 500: { $ref: "#/components/responses/ServerError" },
        },
      },
    },
    "/api/certificates": {
      get: {
        tags: ["Certificates"], summary: "List certificates for the authenticated student", security: [{ bearerAuth: [] }], responses: {
          200: { description: "User certificates.", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, certificates: { type: "array", items: { $ref: "#/components/schemas/Certificate" } } } } } } },
          401: { $ref: "#/components/responses/Unauthorized" }, 500: { $ref: "#/components/responses/ServerError" },
        },
      },
    },
    "/api/roles": {
      get: {
        tags: ["Roles"], summary: "List all roles", security: [{ bearerAuth: [] }], responses: {
          200: { description: "Available roles.", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, roles: { type: "array", items: { $ref: "#/components/schemas/Role" } } } } } } },
          401: { $ref: "#/components/responses/Unauthorized" }, 500: { $ref: "#/components/responses/ServerError" },
        },
      },
    },
    "/api/roles/users": {
      get: {
        tags: ["Roles"], summary: "List users with roles", description: "Restricted to users whose role is Admin or Team Lead.", security: [{ bearerAuth: [] }], responses: {
          200: { description: "Users and roles." }, 401: { $ref: "#/components/responses/Unauthorized" }, 403: { $ref: "#/components/responses/Forbidden" }, 500: { $ref: "#/components/responses/ServerError" },
        },
      },
    },
    "/api/roles/assign": {
      put: {
        tags: ["Roles"], summary: "Assign a role to a user", description: "Restricted to users whose role is Admin or Team Lead.", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["user_id", "role_id"], properties: { user_id: { type: "integer", example: 3 }, role_id: { type: "integer", example: 2 } } } } } }, responses: {
          200: { description: "Role assigned." }, 400: { description: "user_id and role_id are required." }, 401: { $ref: "#/components/responses/Unauthorized" }, 403: { $ref: "#/components/responses/Forbidden" }, 404: { $ref: "#/components/responses/NotFound" }, 500: { $ref: "#/components/responses/ServerError" },
        },
      },
    },
  },
};

module.exports = openapi;
