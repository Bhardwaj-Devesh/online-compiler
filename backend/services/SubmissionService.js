import supabase from '../config/databaseConnect.js';
import generateFile from './generateFile.js';
import executeFile from './execute.js';
import fs from 'fs';

class SubmissionService {
  /**
   * Get user submissions for a specific problem
   */
  async getUserSubmissions(userId, problemId) {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', userId)
        .eq('problem_id', problemId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { submissions: data };
    } catch (error) {
      console.error('Get submissions error:', error);
      throw new Error('Failed to fetch submissions');
    }
  }

  /**
   * Submit a solution for a problem
   */
  async submitSolution(problemId, userId, code, language, problemFiles) {
    try {
      const { problem, inputData, expectedOutput } = problemFiles;

      // Generate and execute the file
      const fileResult = await generateFile(language, code, inputData);

      let filepath = fileResult;
      let execOptions = {};
      
      if ((language === "cpp" || language === "java") && typeof fileResult === "object") {
        filepath = fileResult.codePath;
        execOptions = { inputPath: fileResult.inputPath, outputPath: fileResult.outputPath };
      }

      // Execute the file
      const programOutput = await executeFile(filepath, language, execOptions);

      // If C++/Java, read from output file if exists
      let actualOutput = programOutput;
      if ((language === "cpp" || language === "java") && execOptions.outputPath) {
        if (fs.existsSync(execOptions.outputPath)) {
          actualOutput = fs.readFileSync(execOptions.outputPath, "utf-8");
        }
      }

      // Determine submission status
      const status = actualOutput.trim() === expectedOutput.trim() ? "Success" : "Wrong Answer";

      // Create submission record
      const { data: submission, error: submissionError } = await supabase
        .from("submissions")
        .insert([{
          user_id: userId,
          problem_id: problemId,
          code,
          language,
          status,
        }])
        .select()
        .single();

      if (submissionError) throw submissionError;

      return {
        status,
        expected_output: expectedOutput,
        actual_output: actualOutput,
        submission,
      };
    } catch (error) {
      console.error('Submit solution error:', error);
      throw new Error(error.message || 'Failed to submit solution');
    }
  }

  /**
   * Get submission statistics for a user
   */
  async getUserSubmissionStats(userId) {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('status, language, created_at')
        .eq('user_id', userId);

      if (error) throw error;

      // Calculate statistics
      const totalSubmissions = data.length;
      const successfulSubmissions = data.filter(s => s.status === 'Success').length;
      const successRate = totalSubmissions > 0 ? (successfulSubmissions / totalSubmissions) * 100 : 0;

      // Language distribution
      const languageStats = data.reduce((acc, submission) => {
        acc[submission.language] = (acc[submission.language] || 0) + 1;
        return acc;
      }, {});

      // Recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentSubmissions = data.filter(s => 
        new Date(s.created_at) >= thirtyDaysAgo
      ).length;

      return {
        totalSubmissions,
        successfulSubmissions,
        successRate: Math.round(successRate * 100) / 100,
        languageStats,
        recentSubmissions
      };
    } catch (error) {
      console.error('Get submission stats error:', error);
      throw new Error('Failed to fetch submission statistics');
    }
  }

  /**
   * Get submission history for a problem
   */
  async getProblemSubmissionHistory(problemId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          users:user_id(name, email)
        `)
        .eq('problem_id', problemId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { submissions: data };
    } catch (error) {
      console.error('Get problem submission history error:', error);
      throw new Error('Failed to fetch submission history');
    }
  }

  /**
   * Get submission by ID
   */
  async getSubmissionById(submissionId) {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          users:user_id(name, email),
          problems:problem_id(title)
        `)
        .eq('id', submissionId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Submission not found');

      return { submission: data };
    } catch (error) {
      console.error('Get submission error:', error);
      throw new Error(error.message || 'Failed to fetch submission');
    }
  }
}

export default SubmissionService;
