import express from 'express';
import fetch from 'node-fetch';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv'
dotenv.config();
const __dirname = dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const AGENTS_DIR = path.join(__dirname, '../agents');
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=' + 'AIzaSyBBaYwzNLvuQrXOY1YA8z-CrS2RC2kIKKg';

function loadPromptTemplate(taskType, context) {
  const fileMap = {
    hint: 'hintPrompt.json',
    feedback: 'feedbackPrompt.json',
    explain: 'explainPrompt.json',
    complexity: 'complexityPrompt.json',
  };
  const fileName = fileMap[taskType] || 'structuredPrompt.json';
  const filePath = path.join(AGENTS_DIR, fileName);
  const template = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  // For complexity, only use code_submission and language
  if (taskType === 'complexity') {
    template.context = {
      language: context.language,
      code_submission: context.code_submission
    };
  } else {
    template.context = { ...template.context, ...context };
  }
  
  return template;
}

router.post('/', async (req, res) => {
  const { user_level, language, task_type, problem, code_submission } = req.body;
  const prompt = loadPromptTemplate(task_type, {
    user_level,
    language,
    task_type,
    problem,
    code_submission
  });
  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: JSON.stringify(prompt) }]
          }
        ]
      })
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router; 
