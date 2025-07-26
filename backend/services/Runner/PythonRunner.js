export class PythonRunner {
  constructor(filepath, options = {}) {
    this.filepath = filepath;
    this.options = options;
  }

  getCommand() {
    return `python3 ${this.filepath}`;
  }
} 
