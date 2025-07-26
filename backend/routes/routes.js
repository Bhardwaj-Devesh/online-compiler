import express from "express";
import generateFile from "../services/generateFile.js";
import executeFile from "../services/execute.js";

const router = express.Router();

router.get("/execute", (req, res) => {
    res.json({
        "message": "API router is working"
    });
});

router.post("/execute", async (req, res) => {
    const { language, code, input } = req.body;
  
    if (!language || !code) {
      return res.status(400).json({ error: "Missing language or code" });
    }
  
    try {
      // Validate and generate file
      const fileResult = await generateFile(language, code, input);

      let filepath = fileResult;
      let execOptions = {};
      // For C++ and Java, fileResult is an object with codePath, inputPath, outputPath
      if ((language === "cpp" || language === "java") && typeof fileResult === "object") {
        filepath = fileResult.codePath;
        execOptions = { inputPath: fileResult.inputPath, outputPath: fileResult.outputPath };
      }
  
      // Execute the file
      const output = await executeFile(filepath, language, execOptions);

      // For C++ and Java, if outputPath exists, read and return its contents
      if ((language === "cpp" || language === "java") && execOptions.outputPath) {
        const fs = (await import('fs')).default;
        if (fs.existsSync(execOptions.outputPath)) {
          const jobOutput = fs.readFileSync(execOptions.outputPath, 'utf-8');
          return res.status(200).json({ output: jobOutput });
        }
      }
  
      return res.status(200).json({ output });
    } catch (err) {
      console.error("Execution Error:", err); // Logs full error on server
        return res.status(500).json({ 
            error: err?.message || "Unknown error occurred",
            stack: err?.stack || null,
            raw: err  // Optional: For deep debugging, remove in production
        });
    }
});
  
export default router;
