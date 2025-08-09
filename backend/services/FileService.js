import generateFile from './generateFile.js';
import executeFile from './execute.js';
import fs from 'fs';

class FileService {
  /**
   * Generate and execute a code file
   */
  async generateAndExecute(language, code, inputData) {
    try {
      // Generate the file
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

      return {
        filepath,
        execOptions,
        output: actualOutput,
        success: true
      };
    } catch (error) {
      console.error('Generate and execute error:', error);
      return {
        success: false,
        error: error.message,
        output: error.message
      };
    }
  }

  /**
   * Generate a file without executing
   */
  async generateFile(language, code, inputData) {
    try {
      const fileResult = await generateFile(language, code, inputData);
      return {
        success: true,
        fileResult
      };
    } catch (error) {
      console.error('Generate file error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Execute an existing file
   */
  async executeFile(filepath, language, execOptions = {}) {
    try {
      const output = await executeFile(filepath, language, execOptions);
      
      // If C++/Java, read from output file if exists
      let actualOutput = output;
      if ((language === "cpp" || language === "java") && execOptions.outputPath) {
        if (fs.existsSync(execOptions.outputPath)) {
          actualOutput = fs.readFileSync(execOptions.outputPath, "utf-8");
        }
      }

      return {
        success: true,
        output: actualOutput
      };
    } catch (error) {
      console.error('Execute file error:', error);
      return {
        success: false,
        error: error.message,
        output: error.message
      };
    }
  }

}

export default FileService;
