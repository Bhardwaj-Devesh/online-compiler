import express from "express";
import  router from "./routes/routes.js";
import "./services/cronJob.js";
import cors from "cors";
import aiAgentRoutes from "./routes/aiAgentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import problemRoutes from "./routes/problemRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8081',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);
app.use("/api/ai-agent", aiAgentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


