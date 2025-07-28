import express from "express";
import  router from "./routes/routes.js";
import "./services/cronJob.js";
import cors from "cors";
import aiAgentRoutes from "./routes/aiAgentRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "http://localhost:8080",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);
app.use("/api/ai-agent", aiAgentRoutes);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


