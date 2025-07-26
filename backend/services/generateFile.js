import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import { Language } from "../utils/enum.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getJavaFileDetails = (code, jobId) => {
  const match = code.match(/public\s+class\s+(\w+)/);
  if (!match) {
    throw new Error("No public class found in Java code.");
  }

  const uniqueClassName = `Class_${jobId.replace(/-/g, "")}`;
  const modifiedCode = code.replace(
    /public\s+class\s+\w+/,
    `public class ${uniqueClassName}`
  );

  const filename = `${uniqueClassName}.java`;
  return { filename, modifiedCode };
};

const generateFile = async (language, code, input = null) => {
  if (!Object.values(Language).includes(language)) {
    throw new Error("Unsupported language");
  }
  const jobId = uuidv4();
  let filename = `${jobId}.${language}`;
  let dirPath = path.join(__dirname, "jobs", language);
  let finalCode = code;
  let codePath, inputPath = null, outputPath = null;

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  if (language === "java") {
    const { filename: javaFilename, modifiedCode } = getJavaFileDetails(code, jobId);
    filename = javaFilename;
    finalCode = modifiedCode;
    // Use code/input/output structure for Java
    const codeDir = path.join(dirPath, "code");
    const inputDir = path.join(dirPath, "input");
    const outputDir = path.join(dirPath, "output");
    if (!fs.existsSync(codeDir)) fs.mkdirSync(codeDir, { recursive: true });
    if (!fs.existsSync(inputDir)) fs.mkdirSync(inputDir, { recursive: true });
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const codePath = path.join(codeDir, filename);
    fs.writeFileSync(codePath, finalCode);
    let inputPath = null;
    if (input) {
      inputPath = path.join(inputDir, `${jobId}.txt`);
      fs.writeFileSync(inputPath, input);
    }
    const outputPath = path.join(outputDir, `${jobId}.txt`);
    return { codePath, inputPath, outputPath };
  }

  if (language === "cpp") {
    // Create subdirectories for code, input, output
    const codeDir = path.join(dirPath, "code");
    const inputDir = path.join(dirPath, "input");
    const outputDir = path.join(dirPath, "output");
    if (!fs.existsSync(codeDir)) fs.mkdirSync(codeDir, { recursive: true });
    if (!fs.existsSync(inputDir)) fs.mkdirSync(inputDir, { recursive: true });
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    codePath = path.join(codeDir, filename);
    fs.writeFileSync(codePath, finalCode);
    if (input) {
      inputPath = path.join(inputDir, `${jobId}.txt`);
      fs.writeFileSync(inputPath, input);
    }
    outputPath = path.join(outputDir, `${jobId}.txt`);
    // Output file will be written after execution
    return { codePath, inputPath, outputPath };
  }

  // Default for other languages
  codePath = path.join(dirPath, filename);
  fs.writeFileSync(codePath, finalCode);
  return codePath;
};


export default generateFile;
