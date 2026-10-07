const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { setSocketIO } = require("./services/notificationService");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const jobSeekerRoutes = require("./routes/jobSeekerRoutes");
const recruiterRoutes = require("./routes/recruiterRoutes");
dotenv.config();
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
connectDB();
const notificationRoutes = require("./routes/notificationRoutes");
const app = express();
const server = http.createServer(app);
const candidateInterviewRoutes = require("./routes/candidateInterviewRoutes");
const savedJobRoutes = require("./routes/savedJobRoutes");
// ================================
// MIDDLEWARE
// ================================
const recruiterDashboardRoutes = require("./routes/recruiterDashboardRoutes");
const zegoRoutes =
  require("./routes/zegoRoutes");
const resumeAnalyzerRoutes = require("./routes/resumeAnalyzerRoutes");
const adminRoutes = require("./routes/adminRoutes");
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// IMPORTANT: Body parsers MUST come before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// ================================
// TEST
// ================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "JobConnect API is running",
  });
});

// ================================
// API ROUTES
// ================================
app.use("/api/auth", authRoutes);
app.use("/api/job-seeker", jobSeekerRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/saved-jobs", savedJobRoutes);
app.use("/api/recruiter/interviews", interviewRoutes);
app.use("/api/interviews", candidateInterviewRoutes);
app.use(
  "/api/recruiter/dashboard",
  recruiterDashboardRoutes
);
app.use(
  "/api/interviews",
  zegoRoutes
);
app.use("/api/resume-analyzer", resumeAnalyzerRoutes);
app.use(
  "/api/interviews",
  candidateInterviewRoutes
);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
// ================================
// SOCKET.IO
// ================================

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});
setSocketIO(io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join:user", (userId) => {
    if (!userId) return;

    socket.join(`user:${userId}`);

    console.log(
      `User ${userId} joined notification room`
    );
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});
// ================================
// SERVER
// ================================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`JobConnect server running on port ${PORT}`);
});