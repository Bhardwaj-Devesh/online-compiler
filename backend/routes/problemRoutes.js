import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import multer from 'multer';
import ProblemService from '../services/ProblemService.js';
import SubmissionService from '../services/SubmissionService.js';

const upload = multer();
const router = express.Router();

// Initialize services
const problemService = new ProblemService();
const submissionService = new SubmissionService();

// Get all problems (public)
router.get('/', async(req, res) => {
  try {
    const { topic } = req.query;
    const result = await problemService.getAllProblems(topic);
    res.json(result);
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get problem by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const result = await problemService.getProblemById(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Get problem error:', error);
    if (error.message === 'Problem not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
});

// Get user's submissions for a problem
router.get('/:id/submissions', authenticateToken, async (req, res) => {
  try {
    const result = await submissionService.getUserSubmissions(req.user.id, req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});


router.post('/:id/submit', authenticateToken, async (req, res) => {
  try {
    const { code, language } = req.body;
    const problemId = req.params.id;

    // Validate input
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    // Get problem files
    const problemFiles = await problemService.getProblemFiles(problemId);

    // Submit solution
    const result = await submissionService.submitSolution(
      problemId, 
      req.user.id, 
      code, 
      language, 
      problemFiles
    );

    return res.status(201).json(result);

  } catch (error) {
    console.error('Submit solution error:', error);
    if (error.message === 'Problem not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
});

// Admin: Add new problem
router.post('/', authenticateToken, requireAdmin, upload.fields([
  { name: 'inputFile', maxCount: 1 },
  { name: 'outputFile', maxCount: 1 }
]), async(req, res) => {
  try {
    const result = await problemService.createProblem(req.body, req.files, req.user.id);
    res.status(201).json(result);
  } catch (error) {
    console.error('Add problem error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Admin: Update problem
router.put('/:id', authenticateToken, requireAdmin, upload.fields([
  { name: 'inputFile', maxCount: 1 },
  { name: 'outputFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const result = await problemService.updateProblem(req.params.id, req.body, req.files);
    res.json(result);
  } catch (error) {
    console.error('Update problem error:', error);
    if (error.message === 'Problem not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
});

// Admin: Delete problem
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await problemService.deleteProblem(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Delete problem error:', error);
    if (error.message === 'Problem not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
});

export default router; 