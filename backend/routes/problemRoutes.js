import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import multer from 'multer';
import supabase from '../config/databaseConnect.js';
import generateFile from "../services/generateFile.js";
import executeFile from "../services/execute.js";
import fs from 'fs';

import { 
  problems, 
  findProblemById, 
  addProblem, 
  getUserSubmissions, 
  addSubmission,
  getTopicStats 
} from '../utils/dummyData.js';

const upload = multer();
const router = express.Router();

// Get all problems (public)
router.get('/', async(req, res) => {
  try {
    const { topic } = req.query;

    let query = supabase.from('problems').select('*');

    if (topic) {
      query = query.contains('topic_tags', [topic]);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ problems: data });
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get problem by ID (public)
router.get('/:id',async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Problem not found' });

    res.json({ problem: data });
  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's submissions for a problem
router.get('/:id/submissions', authenticateToken, (req, res) => {
  try {
    const userSubmissions = getUserSubmissions(req.user.id);
    const problemSubmissions = userSubmissions.filter(
      submission => submission.problem_id === req.params.id
    );
    res.json({ submissions: problemSubmissions });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit solution for a problem
router.post('/:id/submit', authenticateToken, async (req, res) => {
  try {
    const { code, language } = req.body;
    const problemId = req.params.id;

    // Validate input
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    // Check if problem exists
    const { data: problem, error: problemError } = await supabase
      .from("problems")
      .select("*")
      .eq("id", problemId)
      .single();

    if (problemError || !problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const { data: inputFile, error: inputError } = await supabase.storage
      .from("problems")
      .download(problem.input_path);

    const { data: outputFile, error: outputError } = await supabase.storage
      .from("problems")
      .download(problem.output_path);

    if (inputError || outputError) {
      console.error("File download error:", inputError || outputError);
      return res.status(500).json({ error: "Error downloading test files" });
    }
    
    const inputData = await inputFile.text();
    const expectedOutput = await outputFile.text();

    const fileResult = await generateFile(language, code, inputData);

    let filepath = fileResult;
    let execOptions = {};
    if ((language === "cpp" || language === "java") && typeof fileResult === "object") {
      filepath = fileResult.codePath;
      execOptions = { inputPath: fileResult.inputPath, outputPath: fileResult.outputPath };
    }

    // 4️⃣ Execute the file
    const programOutput = await executeFile(filepath, language, execOptions);

    // If C++/Java, read from output file if exists
    let actualOutput = programOutput;
    if ((language === "cpp" || language === "java") && execOptions.outputPath) {
      if (fs.existsSync(execOptions.outputPath)) {
        actualOutput = fs.readFileSync(execOptions.outputPath, "utf-8");
      }
    }

    const status =
      actualOutput.trim() === expectedOutput.trim() ? "Success" : "Wrong Answer";

    // Create submission
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .insert([
        {
          user_id: req.user.id,
          problem_id: problemId,
          code,
          language,
          status,
        },
      ])
      .select()
      .single();

     if (submissionError) throw submissionError;

    return res.status(201).json({
      status,
      expected_output: expectedOutput,
      actual_output: actualOutput,
      submission,
    });

  } catch (error) {
    console.error('Submit solution error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Add new problem

router.post('/',authenticateToken,requireAdmin, upload.fields([
  { name: 'inputFile', maxCount: 1 },
  { name: 'outputFile', maxCount: 1 }
]), async(req, res) => {
  try {
    const {
      title,
      problem_statement,
      constraints,
      examples,
      topic_tags
    } = req.body;

    // Validate input
    if (!title || !problem_statement || !constraints || !examples || !topic_tags) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    // upload input and output files
    const problemId = crypto.randomUUID();
    const inputFile = req.files['inputFile']?.[0];
    const outputFile = req.files['outputFile']?.[0];

    if (!inputFile || !outputFile) {
      return res.status(400).json({ error: 'Input and output files are required' });
    }

    const inputPath = `problems/${problemId}/input.txt`;
    const outputPath = `problems/${problemId}/output.txt`;

    const { error: inputError } = await supabase.storage
      .from('problems')
      .upload(inputPath, inputFile.buffer, { contentType: 'text/plain' });
    
    if (inputError) throw inputError;

    const { error: outputError } = await supabase.storage
      .from('problems')
      .upload(outputPath, outputFile.buffer, { contentType: 'text/plain' });

    if (outputError) throw outputError;

    // Create new problem
    const { data, error } = await supabase
      .from('problems')
      .insert([{
        id: problemId,
        title,
        problem_statement,
        constraints,
        examples: JSON.parse(examples), 
        topic_tags: JSON.parse(topic_tags),
        input_path: inputPath,
        output_path: outputPath,
        created_by: req.user.id
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ problem: data });
  } catch (error) {
    console.error('Add problem error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Update problem
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const problemIndex = problems.findIndex(p => p.id === req.params.id);
    if (problemIndex === -1) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const updatedProblem = {
      ...problems[problemIndex],
      ...req.body,
      id: req.params.id // Ensure ID doesn't change
    };

    problems[problemIndex] = updatedProblem;
    res.json({ problem: updatedProblem });
  } catch (error) {
    console.error('Update problem error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Delete problem
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const problemIndex = problems.findIndex(p => p.id === req.params.id);
    if (problemIndex === -1) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    problems.splice(problemIndex, 1);
    res.json({ message: 'Problem deleted successfully' });
  } catch (error) {
    console.error('Delete problem error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 