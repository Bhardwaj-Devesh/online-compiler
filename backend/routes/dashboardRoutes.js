import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
  getUserSubmissions, 
  getTopicStats, 
  findUserById,
  problems 
} from '../utils/dummyData.js';

const router = express.Router();

// Get user dashboard analytics
router.get('/analytics', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user submissions
    const userSubmissions = getUserSubmissions(userId);
    
    // Get topic-wise solved stats
    const topicStats = getTopicStats(userId);
    
    // Calculate overall stats
    const totalSubmissions = userSubmissions.length;
    const successfulSubmissions = userSubmissions.filter(s => s.status === 'Success').length;
    const successRate = totalSubmissions > 0 ? (successfulSubmissions / totalSubmissions) * 100 : 0;
    
    // Get unique problems solved
    const solvedProblems = new Set(
      userSubmissions
        .filter(s => s.status === 'Success')
        .map(s => s.problem_id)
    );
    
    // Get recent submissions (last 5)
    const recentSubmissions = userSubmissions
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
    
    // Get problems by difficulty (for now, we'll categorize by topic)
    const problemsByTopic = {};
    problems.forEach(problem => {
      problem.topic_tags.forEach(topic => {
        if (!problemsByTopic[topic]) {
          problemsByTopic[topic] = [];
        }
        problemsByTopic[topic].push(problem);
      });
    });
    
    res.json({
      analytics: {
        totalSubmissions,
        successfulSubmissions,
        successRate: Math.round(successRate * 100) / 100,
        problemsSolved: solvedProblems.size,
        topicStats,
        recentSubmissions,
        problemsByTopic
      }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile with stats
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const user = findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userSubmissions = getUserSubmissions(req.user.id);
    const topicStats = getTopicStats(req.user.id);
    
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      user: userWithoutPassword,
      stats: {
        totalSubmissions: userSubmissions.length,
        problemsSolved: new Set(
          userSubmissions
            .filter(s => s.status === 'Success')
            .map(s => s.problem_id)
        ).size,
        topicStats
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user submissions history
router.get('/submissions', authenticateToken, (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userSubmissions = getUserSubmissions(req.user.id);
    
    // Filter by status if provided
    let filteredSubmissions = userSubmissions;
    if (status) {
      filteredSubmissions = userSubmissions.filter(s => s.status === status);
    }
    
    // Sort by creation date (newest first)
    filteredSubmissions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedSubmissions = filteredSubmissions.slice(startIndex, endIndex);
    
    res.json({
      submissions: paginatedSubmissions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredSubmissions.length / limit),
        totalSubmissions: filteredSubmissions.length,
        hasNextPage: endIndex < filteredSubmissions.length,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Submissions history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 