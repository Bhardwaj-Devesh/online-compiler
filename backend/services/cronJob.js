import cron from "node-cron";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jobsDir = path.join(__dirname, "jobs");

cron.schedule("* * * * *", () => {
  if (fs.existsSync(jobsDir)) {
    fs.rmSync(jobsDir, { recursive: true, force: true });
    console.log("[CRON] Cleaned jobs directory at", new Date().toISOString());
  }
});
