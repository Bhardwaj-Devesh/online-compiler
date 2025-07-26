// Simulated code execution for different languages
export const runCode = async (language: string, code: string, input: string): Promise<string> => {
  // Simulate execution delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  try {
    switch (language) {
      case 'javascript':
        return runJavaScript(code, input);
      case 'python':
        return runPython(code, input);
      case 'cpp':
        return runCpp(code, input);
      case 'java':
        return runJava(code, input);
      case 'typescript':
        return runTypeScript(code, input);
      default:
        return 'Language not supported yet.';
    }
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
  }
};

const runJavaScript = (code: string, input: string): string => {
  try {
    // Simple simulation for JavaScript
    if (code.includes('console.log')) {
      const lines = code.split('\n');
      const outputs: string[] = [];
      
      lines.forEach(line => {
        const match = line.match(/console\.log\(([^)]+)\)/);
        if (match) {
          let output = match[1].replace(/['"]/g, '');
          // Simple variable substitution
          if (output.includes('+')) {
            output = output.replace(/\s*\+\s*/g, '');
          }
          outputs.push(output);
        }
      });
      
      return outputs.length > 0 ? outputs.join('\n') : 'No output';
    }
    
    if (code.includes('alert')) {
      return 'Alert: Hello World!';
    }
    
    return 'Code executed successfully (no output)';
  } catch (error) {
    return `JavaScript Error: ${error}`;
  }
};

const runPython = (code: string, input: string): string => {
  try {
    // Simple simulation for Python
    if (code.includes('print(')) {
      const lines = code.split('\n');
      const outputs: string[] = [];
      
      lines.forEach(line => {
        const match = line.match(/print\(([^)]+)\)/);
        if (match) {
          let output = match[1].replace(/['"]/g, '');
          outputs.push(output);
        }
      });
      
      if (code.includes('input()') && input) {
        outputs.push(`Input received: ${input}`);
      }
      
      return outputs.length > 0 ? outputs.join('\n') : 'No output';
    }
    
    if (code.includes('input()')) {
      return input ? `You entered: ${input}` : 'Waiting for input...';
    }
    
    return 'Code executed successfully (no output)';
  } catch (error) {
    return `Python Error: ${error}`;
  }
};

const runCpp = (code: string, input: string): string => {
  try {
    // Simple simulation for C++
    if (code.includes('cout')) {
      const lines = code.split('\n');
      const outputs: string[] = [];
      
      lines.forEach(line => {
        if (line.includes('cout')) {
          const match = line.match(/cout\s*<<\s*"([^"]+)"/);
          if (match) {
            outputs.push(match[1]);
          } else if (line.includes('endl') || line.includes('\\n')) {
            outputs.push('');
          }
        }
      });
      
      if (code.includes('cin') && input) {
        outputs.push(`Input processed: ${input}`);
      }
      
      return outputs.length > 0 ? outputs.join('\n') : 'No output';
    }
    
    return 'C++ code compiled and executed successfully';
  } catch (error) {
    return `C++ Error: ${error}`;
  }
};

const runJava = (code: string, input: string): string => {
  try {
    // Simple simulation for Java
    if (code.includes('System.out.print')) {
      const lines = code.split('\n');
      const outputs: string[] = [];
      
      lines.forEach(line => {
        const match = line.match(/System\.out\.print(?:ln)?\(([^)]+)\)/);
        if (match) {
          let output = match[1].replace(/['"]/g, '');
          outputs.push(output);
        }
      });
      
      if (code.includes('Scanner') && input) {
        outputs.push(`Scanner input: ${input}`);
      }
      
      return outputs.length > 0 ? outputs.join('\n') : 'No output';
    }
    
    return 'Java code compiled and executed successfully';
  } catch (error) {
    return `Java Error: ${error}`;
  }
};

const runTypeScript = (code: string, input: string): string => {
  // TypeScript runs similar to JavaScript for this simulation
  return runJavaScript(code, input) + '\n(TypeScript compiled to JavaScript)';
};