import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { 
  problems, 
  findProblemById, 
  addProblem, 
  getUserSubmissions, 
  addSubmission,
  getTopicStats 
} from '../utils/dummyData.js';

const router = express.Router();

// Get all problems (public)
router.get('/', (req, res) => {
  try {
    const { topic } = req.query;
    
    let filteredProblems = problems;
    if (topic) {
      filteredProblems = problems.filter(problem => 
        problem.topic_tags.includes(topic)
      );
    }

    res.json({ problems: filteredProblems });
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get problem by ID (public)
router.get('/:id', (req, res) => {
  try {
    const problem = findProblemById(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    res.json({ problem });
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
    const { code, language, input } = req.body;
    const problemId = req.params.id;

    // Validate input
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    // Check if problem exists
    const problem = findProblemById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // For now, we'll simulate execution and always return success
    // In a real implementation, you'd run the code against test cases
    const output = "Simulated output"; // This would be the actual execution result
    const status = "Success"; // This would be determined by comparing with expected output

    // Create submission
    const submission = addSubmission({
      user_id: req.user.id,
      problem_id: problemId,
      code,
      language,
      input: input || '',
      output,
      status
    });

    res.status(201).json({ submission });
  } catch (error) {
    console.error('Submit solution error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Add new problem
router.post('/', authenticateToken, requireAdmin, (req, res) => {
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

    // Create new problem
    const newProblem = addProblem({
      title,
      problem_statement,
      input_path: `problems/${Date.now()}/input.txt`,
      output_path: `problems/${Date.now()}/output.txt`,
      constraints,
      examples,
      topic_tags,
      created_by: req.user.id
    });

    res.status(201).json({ problem: newProblem });
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