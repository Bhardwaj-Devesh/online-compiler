import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import CodeEditor from '@/components/CodeEditor';
import InputOutput from '@/components/InputOutput';
import SettingsPanel from '@/components/SettingsPanel';
import { runCode } from '@/utils/codeRunner';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const defaultCode = {
  javascript: `// Welcome to CodeFlow!
console.log("Hello, World!");

// Try changing this message and click Run
const message = "JavaScript is awesome!";
console.log(message);`,
  
  python: `# Welcome to CodeFlow!
print("Hello, World!")

# Try changing this message and click Run
message = "Python is awesome!"
print(message)

# Uncomment the line below to test input
# name = input("Enter your name: ")
# print(f"Hello, {name}!")`,
  
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Welcome to CodeFlow!
    cout << "Hello, World!" << endl;
    
    // Try changing this message and click Run
    string message = "C++ is awesome!";
    cout << message << endl;
    
    return 0;
}`,
  
  java: `public class Main {
    public static void main(String[] args) {
        // Welcome to CodeFlow!
        System.out.println("Hello, World!");
        
        // Try changing this message and click Run
        String message = "Java is awesome!";
        System.out.println(message);
    }
}`,

  typescript: `// Welcome to CodeFlow!
console.log("Hello, World!");

// Try changing this message and click Run
const message: string = "TypeScript is awesome!";
console.log(message);

// Type-safe function
function greet(name: string): string {
    return \`Hello, \${name}!\`;
}`
};

const Index = () => {
  const [language, setLanguage] = useState<string>('javascript');
  const [code, setCode] = useState<string>(defaultCode.javascript);
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [fontFamily, setFontFamily] = useState<string>('Fira Code');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  
  const { toast } = useToast();

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Change default code when language changes
  useEffect(() => {
    setCode(defaultCode[language as keyof typeof defaultCode] || '');
  }, [language]);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setOutput(''); // Clear output when switching languages
  };

  const handleRun = async () => {
    if (!code.trim()) {
      toast({
        title: "No code to run",
        description: "Please write some code before running.",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setOutput('');
    
    try {
      const result = await runCode(language, code, input);
      setOutput(result);
      
      toast({
        title: "Code executed successfully!",
        description: `Your ${language} code has been run.`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setOutput(`Execution Error: ${errorMessage}`);
      
      toast({
        title: "Execution failed",
        description: "There was an error running your code.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSettingsClick={() => setIsSettingsOpen(true)} />
      
      <main className="h-[calc(100vh-80px)] p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
          {/* Code Editor */}
          <div className="h-full">
            <CodeEditor
              language={language}
              onLanguageChange={handleLanguageChange}
              code={code}
              onCodeChange={setCode}
              onRun={handleRun}
              theme={theme}
              fontFamily={fontFamily}
            />
          </div>
          
          {/* Input/Output */}
          <div className="h-full">
            <InputOutput
              input={input}
              onInputChange={setInput}
              output={output}
              isRunning={isRunning}
              fontFamily={fontFamily}
            />
          </div>
        </div>
      </main>

      {/* Settings Panel */}
      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Editor Settings</SheetTitle>
            <SheetDescription>
              Customize your coding environment with themes and fonts.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <SettingsPanel
              theme={theme}
              onThemeChange={setTheme}
              fontFamily={fontFamily}
              onFontFamilyChange={setFontFamily}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Index;