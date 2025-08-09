import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Play, 
  CheckCircle, 
  Clock, 
  Target,
  Code2,
  FileText,
  AlertTriangle
} from 'lucide-react';
import CodeEditor from '@/components/CodeEditor';
import { runCode } from '@/utils/codeRunner';

interface Problem {
  id: string;
  title: string;
  problem_statement: string;
  constraints: string;
  examples: Array<{ input: string; output: string }>;
  topic_tags: string[];
  created_at: string;
}

const ProblemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, token, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [problem, setProblem] = useState<Problem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('problem');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  useEffect(() => {
    if (id) {
      fetchProblem();
    }
  }, [id]);

  const fetchProblem = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_URL + `/problems/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProblem(data.problem);
        
        // Set default code based on language
        setDefaultCode(data.problem);
      }
    } catch (error) {
      console.error('Failed to fetch problem:', error);
      toast({
        title: "Error",
        description: "Failed to load problem details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setDefaultCode = (problem: Problem) => {
    const defaultCodeMap = {
      
      cpp: `#include <iostream>
#include <string>
using namespace std;

// ${problem.title}
// Write your solution here

string solution(string input) {
    // Your code here
    return input;
}

int main() {
    string input;
    getline(cin, input);
    cout << solution(input) << endl;
    return 0;
}`,
  java: `import java.util.*;

// ${problem.title}
// Write your solution here

public class Solution {
    public static String solution(String input) {
        // Your code here
        return input;
    }
    
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String input = scanner.nextLine();
        System.out.println(solution(input));
        scanner.close();
    }
}`
    };
    
    setCode(defaultCodeMap[language as keyof typeof defaultCodeMap] || defaultCodeMap.cpp);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setOutput('');
    if (problem) {
      setDefaultCode(problem);
    }
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

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit your solution.",
        variant: "destructive",
      });
      return;
    }

    if (!code.trim()) {
      toast({
        title: "No code to submit",
        description: "Please write some code before submitting.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    setSubmissionResult(null);
    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_URL + `/problems/${id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          input
        }),
      });

      const data = await response.json();

      if (response.ok) {
      setSubmissionResult(data);

      if (data.status === "Success") {
        toast({
          title: "Successful Submission 🎉",
          description: "Your solution passed all test cases.",
        });
      } else {
        toast({
          title: "Wrong Answer ❌",
          description: "Your solution did not produce the expected output.",
          variant: "destructive",
        });
      }
      } else {
        toast({
          title: "Submission failed",
          description: data.error || "Failed to submit solution",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Submission failed",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading problem...</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Problem not found</h3>
          <p className="text-muted-foreground mb-4">
            The problem you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link to="/problems">Back to Problems</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link to="/problems">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Problems
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{problem.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  {problem.topic_tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user?.role !== "admin" && (
                <Button asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              )}
              <Button asChild>
                <Link to="/">Code Editor</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Problem Description */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="problem">Problem</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
                <TabsTrigger value="constraints">Constraints</TabsTrigger>
              </TabsList>
              
              <TabsContent value="problem" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Problem Statement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <div dangerouslySetInnerHTML={{ 
                        __html: problem.problem_statement
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                          .replace(/`(.*?)`/g, '<code>$1</code>')
                          .replace(/\n/g, '<br>')
                      }} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="examples" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Examples</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {problem.examples.map((example, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-2">Example {index + 1}:</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Input:</p>
                              <pre className="bg-muted p-2 rounded text-sm">{example.input}</pre>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Output:</p>
                              <pre className="bg-muted p-2 rounded text-sm">{example.output}</pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="constraints" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Constraints</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap">{problem.constraints}</pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Code Editor */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5" />
                  Code Editor
                </CardTitle>
                <CardDescription>
                  Write your solution and test it
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeEditor
                  language={language}
                  onLanguageChange={handleLanguageChange}
                  code={code}
                  onCodeChange={setCode}
                  onRun={handleRun}
                  theme="light"
                  fontFamily="Fira Code"
                />
              </CardContent>
            </Card>

            {/* Input/Output */}
            <Card>
              <CardHeader>
                <CardTitle>Input & Output</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Input:</label>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full h-20 p-2 border rounded-md font-mono text-sm"
                    placeholder="Enter test input..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Output:</label>
                  <pre className="w-full min-h-[80px] p-2 border rounded-md font-mono text-sm bg-muted whitespace-pre-wrap">
                    {output || "Run your code to see output here..."}
                  </pre>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleRun} 
                    disabled={isRunning}
                    className="flex-1"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isRunning ? 'Running...' : 'Run Code'}
                  </Button>
                  <Button 
                      onClick={handleSubmit}
                      disabled={!isAuthenticated || isRunning || isSubmitting}
                      variant="outline"
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Submit Solution
                        </>
                      )}
                  </Button>
                  
                </div>
                
                {submissionResult && (
                    <div className="mt-4 p-3 border rounded-md bg-muted text-sm">
                      <p className={`font-bold ${submissionResult.status === "Success" ? "text-green-600" : "text-red-600"}`}>
                        {submissionResult.status === "Success" ? "✅ Successful Submission" : "❌ Wrong Answer"}
                      </p>
                      {submissionResult.status !== "Success" && (
                        <div className="mt-2">
                          <p className="font-medium">Expected Output:</p>
                          <pre className="bg-background p-2 rounded">{submissionResult.expected_output}</pre>
                          <p className="font-medium mt-2">Your Output:</p>
                          <pre className="bg-background p-2 rounded">{submissionResult.actual_output}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail; 