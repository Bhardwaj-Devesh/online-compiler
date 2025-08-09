import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MarkdownRenderer from '@/components/ui/markdown-renderer';
import HintAgent from './agents/HintAgent';
import FeedbackAgent from './agents/FeedbackAgent';
import ExplainAgent from './agents/ExplainAgent';
import ComplexityAgent from './agents/ComplexityAgent';

interface InputOutputProps {
  input: string;
  onInputChange: (input: string) => void;
  output: string;
  isRunning: boolean;
  fontFamily: string;
  language: string;
  code: string;
  problemTitle: string;
  problemDescription: string;
  problemConstraints: string[];
  setProblemTitle: (title: string) => void;
  setProblemDescription: (desc: string) => void;
  setProblemConstraints: (c: string[]) => void;
  constraintInput: string;
  setConstraintInput: (c: string) => void;
}

const InputOutput = ({ input, onInputChange, output, isRunning, fontFamily, language, code }: InputOutputProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('input');
  const [aiTab, setAiTab] = useState<'hint' | 'feedback' | 'explain' | 'complexity' | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);



  // Auto-switch to output tab when running
  useEffect(() => {
    if (isRunning) {
      setActiveTab('output');
    }
  }, [isRunning]);

  // Helper to call AI agent API
  const doAICall = async (taskType: 'hint' | 'feedback' | 'explain' | 'complexity', problemData?: { title: string; description: string; constraints: string[] }) => {
    setAiLoading(true);
    setAiResponse(null);
    try {
      const requestBody = taskType === 'complexity' 
        ? {
            user_level: 'beginner',
            language,
            task_type: taskType,
            code_submission: code
          }
        : {
            user_level: 'beginner',
            language,
            task_type: taskType,
            problem: problemData || {
              title: '',
              description: '',
              constraints: []
            },
            code_submission: input,
            user_history: [],
            attempt_count: 1,
            last_error: ''
          };

      const res = await fetch(import.meta.env.VITE_BACKEND_URL + '/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      if (!res.ok) throw new Error('AI agent error');
      const data = await res.json();
      setAiResponse(data.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(data));
    } catch (err) {
      setAiResponse('AI Agent Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setAiLoading(false);
    }
  };

  // Handler for AI feature buttons
  const handleAICall = (taskType: 'hint' | 'feedback' | 'explain' | 'complexity') => {
    setAiTab(taskType);
    setActiveTab(taskType);
    setAiResponse(null);
  };



  const handleCopyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast({
        title: "Output copied!",
        description: "Output has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy output to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleClearInput = () => {
    onInputChange('');
  };

  return (
    <Card className="h-full shadow-editor">
      <CardContent className="p-0 h-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b border-editor-border p-4 bg-gradient-surface flex items-center justify-between">
            <TabsList className="grid grid-cols-2 md:grid-cols-2 gap-2 w-auto">
              <TabsTrigger value="input">Input</TabsTrigger>
              <TabsTrigger value="output">Output</TabsTrigger>
            </TabsList>

            <div className="flex gap-2 ml-4">
              <button
                className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition-colors shadow-sm"
                onClick={() => handleAICall('hint')}
                type="button"
              >
                Hint
              </button>
              <button
                className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-200 transition-colors shadow-sm"
                onClick={() => handleAICall('feedback')}
                type="button"
              >
                Feedback
              </button>
              <button
                className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold hover:bg-purple-200 transition-colors shadow-sm"
                onClick={() => handleAICall('explain')}
                type="button"
              >
                Explain
              </button>
              <button
                className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold hover:bg-orange-200 transition-colors shadow-sm"
                onClick={() => handleAICall('complexity')}
                type="button"
              >
                Complexity
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <TabsContent value="input" className="h-full m-0 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Standard Input (stdin)
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearInput}
                  className="gap-2"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear
                </Button>
              </div>
              <Textarea
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder="Enter your input here..."
                className="h-[calc(100vh-280px)] resize-none border-editor-border"
                style={{ fontFamily }}
              />
            </TabsContent>
            
            <TabsContent value="output" className="h-full m-0 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Output
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyOutput}
                  disabled={!output}
                  className="gap-2"
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </Button>
              </div>
              <div 
                className="h-[calc(100vh-280px)] p-3 bg-code-background border border-editor-border rounded-md overflow-auto"
                style={{ fontFamily }}
              >
                {isRunning ? (
                  <div className="flex items-center gap-2 text-primary">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    Running code...
                  </div>
                ) : output ? (
                  <pre className="text-sm whitespace-pre-wrap text-foreground">
                    {output}
                  </pre>
                ) : (
                  <div className="text-muted-foreground text-sm">
                    Output will appear here after running your code...
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="hint" className="h-full m-0 p-4">
              <HintAgent
                language={language}
                input={input}
                aiLoading={aiLoading}
                aiResponse={aiResponse}
                onAICall={doAICall}
              />
            </TabsContent>
            <TabsContent value="feedback" className="h-full m-0 p-4">
              <FeedbackAgent
                language={language}
                input={input}
                aiLoading={aiLoading}
                aiResponse={aiResponse}
                onAICall={doAICall}
              />
            </TabsContent>
            <TabsContent value="explain" className="h-full m-0 p-4">
              <ExplainAgent
                language={language}
                input={input}
                aiLoading={aiLoading}
                aiResponse={aiResponse}
                onAICall={doAICall}
              />
            </TabsContent>
            <TabsContent value="complexity" className="h-full m-0 p-4">
              <ComplexityAgent
                language={language}
                code={code}
                aiLoading={aiLoading}
                aiResponse={aiResponse}
                onAICall={doAICall}
              />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
      {/* AI Response Modal */}
      <Dialog open={aiModalOpen} onOpenChange={setAiModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Agent Response</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {aiLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2">Loading...</span>
              </div>
            ) : aiResponse ? (
              <MarkdownRenderer content={aiResponse} />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

    </Card>
  );
};

export default InputOutput;
