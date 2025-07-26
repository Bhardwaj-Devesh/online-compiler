// Simulated code execution for different languages
export const runCode = async (language: string, code: string, input: string): Promise<string> => {
  try {
    const response = await fetch('http://localhost:3000/api/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ language, code, input }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to execute code');
    }
    const data = await response.json();
    return data.output || 'No output';
  } catch (error) {
    return `Execution Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
  }
};
