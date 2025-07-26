import { exec } from "child_process";
import { RunnerFactory } from "./Runner/RunnerFactory.js";

const executeFile = (filepath, language, options = {}) => {
  return new Promise((resolve, reject) => {
    let runner;
    try {
      runner = RunnerFactory(language, filepath, options);
    } catch (err) {
      return reject({ error: err.message });
    }

    let command = runner.getCommand();
    // For C++ and Java, handle input/output redirection if options are provided
    if ((language === "cpp" || language === "java")) {
      if (options.inputPath) {
        command += ` < ${options.inputPath}`;
      }
      if (options.outputPath) {
        command += ` > ${options.outputPath}`;
      }
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject({ error: stderr || error.message });
      }
      resolve(stdout);
    });
  });
};

export default executeFile;


/*
Why we use promise here?
Because we want to execute the file asynchronously and we want to wait for the file to execute and return the result.
If we don't use promise, we can't execute the file asynchronously and we can't wait for the file to execute and return the result.
So we use promise to execute the file asynchronously and wait for the file to execute and return the result.







*/
