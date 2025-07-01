import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import http from "http";
import { Server } from "socket.io";

// Import multer middleware
import {upload} from "./middlewares/multer.js";

// Routes and Middleware
import authMiddleware from "./middlewares/authMiddleware.js";
import profileRouter from "./routes/profileRoutes.js";
import userRouter from "./routes/userRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import planRouter from "./routes/planRoutes.js";
import reportRouter from "./routes/reportRoutes.js";
import goalRouter from "./routes/goalRoutes.js";
import kpiRouter from "./routes/kpiRoutes.js";
import kraRouter from "./routes/kraRoutes.js";
import sectorRouter from "./routes/sectorRoutes.js";
import subsectorRouter from "./routes/subsectorRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import goal2Router from "./routes/goalRoute2.js";
import kra2Router from "./routes/kraRoute2.js";
import kpi2Router from "./routes/kpiRoute2.js";
import kpiAssignmentRouter from "./routes/kpiAssignmentRoutes.js";
import menuRouter from "./routes/menuRoutes.js";
import kpiYearAssignmentRouter from "./routes/kpiYearAssignmentRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import performanceRoutes from "./routes/performanceRoutes.js";
import targetRouter from "./routes/targetValidationRoutes.js";
import performanceValidationRouter from "./routes/performanceValidationRoutes.js";
import chatRouter from "./routes/chatRouter.js";
import KpiTableRouter from "./routes/kpiTableRoutes.js";
import measureAssignmentRouter from "./routes/measureAssignmentRoutes.js";
import kpiMeasureRouter from "./routes/measureRoutes.js";
import workerPlanRouter from "./routes/workerPlanRoute.js";
import WorkerPerformanceRouter from "./routes/workerPerformanceRoutes.js";
import notifyRouter from "./routes/notifyRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
connectDB();

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "https://pmes-gimp.onrender.com",
  "https://mint-pmes.onrender.com"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));



// Serve uploaded files statically from absolute path
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes setup
app.get("/api/profile", authMiddleware, profileRouter);
app.use("/api/users", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/plan", planRouter);
app.use("/api/reports", reportRouter);
app.use("/api/goal", goalRouter);
app.use("/api/kras", kraRouter);
app.use("/api/kpis", kpiRouter);
app.use("/api/kpis2", kpi2Router);
app.use("/api/sector", sectorRouter);
app.use("/api/subsector", subsectorRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/goal2", goal2Router);
app.use("/api/kras2", kra2Router);
app.use("/api/assign", kpiAssignmentRouter);
app.use("/api/menu", menuRouter);
app.use("/api/year", kpiYearAssignmentRouter);
app.use("/api", planRoutes);
app.use('/api/plans', planRouter);
app.use("/api", performanceRoutes);
app.use("/api/target-validation", targetRouter);
app.use("/api/performance-validation", performanceValidationRouter);
app.use("/api/chat", chatRouter);
app.use("/api/users/update-profile", profileRouter);
app.use('/api/performance', performanceRoutes);
app.use("/api/kpi-table", KpiTableRouter);
app.use("/api/kra2", kra2Router);
app.use("/api/kpi2", kpi2Router);
app.use('/api/measure-assignment', measureAssignmentRouter);
app.use("/api/measure", kpiMeasureRouter);
app.use("/api/worker-plans", workerPlanRouter);
app.use("/api/worker-performance", WorkerPerformanceRouter);
app.use('/api/notify', notifyRouter);

// Socket.io setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://mint-pmes.onrender.com",
    credentials: true,
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  socket.on("identify", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});

app.get("/", (req, res) => {
  res.send("online server");
});

export { io, onlineUsers, server };

const PORT = process.env.PORT || 1221;
server.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
