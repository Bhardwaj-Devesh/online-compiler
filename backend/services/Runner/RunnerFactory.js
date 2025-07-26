import { CppRunner } from "./CppRunner.js";
import { JavaRunner } from "./JavaRunner.js";
import { PythonRunner } from "./PythonRunner.js";

export const RunnerFactory = (language, filepath, options = {}) => {
	switch (language) {
	  case "cpp":
		return new CppRunner(filepath, options);
	  case "java":
		return new JavaRunner(filepath, options);
	  case "py":
		return new PythonRunner(filepath);
	  default:
		throw new Error(`Unsupported language: ${language}`);
	}
  };

