import path from "path";

export class CppRunner {
  constructor(filepath, options = {}) {
    this.filepath = filepath;
    this.options = options;
  }

  getCommand() {
    const outputPath = this.filepath.replace(/\.cpp$/, "");
    return `g++ ${this.filepath} -o ${outputPath} && ${outputPath}`;
  }
}