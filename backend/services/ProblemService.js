import supabase from '../config/databaseConnect.js';
import { StorageService } from './StorageService.js';

class ProblemService {
  constructor() {
    this.storageService = new StorageService();
  }

  /**
   * Get all problems with optional topic filtering
   */
  async getAllProblems(topic = null) {
    try {
      let query = supabase.from('problems').select('*');

      if (topic) {
        query = query.contains('topic_tags', [topic]);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { problems: data };
    } catch (error) {
      console.error('Get problems error:', error);
      throw new Error('Failed to fetch problems');
    }
  }

  /**
   * Get problem by ID
   */
  async getProblemById(problemId) {
    try {
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .eq('id', problemId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Problem not found');

      return { problem: data };
    } catch (error) {
      console.error('Get problem error:', error);
      throw new Error(error.message || 'Failed to fetch problem');
    }
  }

  /**
   * Create a new problem
   */
  async createProblem(problemData, files, userId) {
    try {
      const {
        title,
        problem_statement,
        constraints,
        examples,
        topic_tags
      } = problemData;

      // Validate required fields
      if (!title || !problem_statement || !constraints || !examples || !topic_tags) {
        throw new Error('All fields are required');
      }

      // Validate files
      const inputFile = files['inputFile']?.[0];
      const outputFile = files['outputFile']?.[0];

      if (!inputFile || !outputFile) {
        throw new Error('Input and output files are required');
      }

      // Generate problem ID
      const problemId = crypto.randomUUID();

      // Upload files to storage
      const inputPath = `problems/${problemId}/input.txt`;
      const outputPath = `problems/${problemId}/output.txt`;

      await this.storageService.uploadFile(inputPath, inputFile.buffer);
      await this.storageService.uploadFile(outputPath, outputFile.buffer);

      // Create problem in database
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
          created_by: userId
        }])
        .select()
        .single();

      if (error) throw error;

      return { problem: data };
    } catch (error) {
      console.error('Create problem error:', error);
      throw new Error(error.message || 'Failed to create problem');
    }
  }

  /**
   * Update an existing problem
   */
  async updateProblem(problemId, problemData, files) {
    try {
      const {
        title,
        problem_statement,
        constraints,
        examples,
        topic_tags
      } = problemData;

      // Validate required fields
      if (!title || !problem_statement || !constraints || !examples || !topic_tags) {
        throw new Error('All fields are required');
      }

      // Check if problem exists
      const { data: existingProblem, error: fetchError } = await supabase
        .from('problems')
        .select('*')
        .eq('id', problemId)
        .single();

      if (fetchError || !existingProblem) {
        throw new Error('Problem not found');
      }

      const updateData = {
        title,
        problem_statement,
        constraints,
        examples: JSON.parse(examples),
        topic_tags: JSON.parse(topic_tags),
      };

      // Handle file uploads if provided
      const inputFile = files['inputFile']?.[0];
      const outputFile = files['outputFile']?.[0];

      if (inputFile) {
        const inputPath = `problems/${problemId}/input.txt`;
        await this.storageService.uploadFile(inputPath, inputFile.buffer, true);
        updateData.input_path = inputPath;
      }

      if (outputFile) {
        const outputPath = `problems/${problemId}/output.txt`;
        await this.storageService.uploadFile(outputPath, outputFile.buffer, true);
        updateData.output_path = outputPath;
      }

      // Update problem in database
      const { data, error } = await supabase
        .from('problems')
        .update(updateData)
        .eq('id', problemId)
        .select()
        .single();

      if (error) throw error;

      return { problem: data };
    } catch (error) {
      console.error('Update problem error:', error);
      throw new Error(error.message || 'Failed to update problem');
    }
  }

  /**
   * Delete a problem and its associated files
   */
  async deleteProblem(problemId) {
    try {
      // Check if problem exists and get file paths
      const { data: problem, error: fetchError } = await supabase
        .from('problems')
        .select('input_path, output_path')
        .eq('id', problemId)
        .single();

      if (fetchError || !problem) {
        throw new Error('Problem not found');
      }

      // Delete files from storage if they exist
      if (problem.input_path) {
        await this.storageService.deleteFile(problem.input_path);
      }

      if (problem.output_path) {
        await this.storageService.deleteFile(problem.output_path);
      }

      // Delete problem from database
      const { error } = await supabase
        .from('problems')
        .delete()
        .eq('id', problemId);

      if (error) throw error;

      return { message: 'Problem deleted successfully' };
    } catch (error) {
      console.error('Delete problem error:', error);
      throw new Error(error.message || 'Failed to delete problem');
    }
  }


  async getProblemFiles(problemId) {
    try {
      const { data: problem, error: problemError } = await supabase
        .from("problems")
        .select("*")
        .eq("id", problemId)
        .single();

      if (problemError || !problem) {
        throw new Error("Problem not found");
      }

      // Download files from storage
      const inputFile = await this.storageService.downloadFile(problem.input_path);
      const outputFile = await this.storageService.downloadFile(problem.output_path);

      const inputData = await inputFile.text();
      const expectedOutput = await outputFile.text();

      return {
        problem,
        inputData,
        expectedOutput
      };
    } catch (error) {
      console.error('Get problem files error:', error);
      throw new Error(error.message || 'Failed to get problem files');
    }
  }
}

export default ProblemService;
