import path from "path";

export class JavaRunner {
	constructor(filepath, options = {}) {
	  this.filepath = filepath;
	  this.options = options;
	}
  
	getCommand() {
	  const dir = path.dirname(this.filepath);
	  const filename = path.basename(this.filepath);
	  const classname = filename.replace(/\.java$/, "");
	  return `javac ${this.filepath} && java -cp ${dir} ${classname}`;
	}
  }
 
