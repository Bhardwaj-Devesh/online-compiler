import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface InputOutputProps {
  input: string;
  onInputChange: (input: string) => void;
  output: string;
  isRunning: boolean;
  fontFamily: string;
  language: string;
  problemTitle: string;
  problemDescription: string;
  problemConstraints: string[];
  setProblemTitle: (title: string) => void;
  setProblemDescription: (desc: string) => void;
  setProblemConstraints: (c: string[]) => void;
  constraintInput: string;
  setConstraintInput: (c: string) => void;
}

const InputOutput = ({ input, onInputChange, output, isRunning, fontFamily, language }: InputOutputProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('input');
  const [aiTab, setAiTab] = useState<'hint' | 'feedback' | 'explain' | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [problemModalOpen, setProblemModalOpen] = useState(false);
  const [pendingTaskType, setPendingTaskType] = useState<'hint' | 'feedback' | 'explain' | null>(null);

  // Problem details state (now local)
  const [problemTitle, setProblemTitle] = useState<string>('');
  const [problemDescription, setProblemDescription] = useState<string>('');
  const [problemConstraints, setProblemConstraints] = useState<string[]>([]);
  const [constraintInput, setConstraintInput] = useState<string>('');
  const constraintInputRef = useRef<HTMLInputElement>(null);

  // Auto-switch to output tab when running
  useEffect(() => {
    if (isRunning) {
      setActiveTab('output');
    }
  }, [isRunning]);

  // Helper to call AI agent API
  const doAICall = async (taskType: 'hint' | 'feedback' | 'explain') => {
    setAiLoading(true);
    setAiResponse(null);
    try {
      const res = await fetch('http://localhost:3000/api/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_level: 'beginner',
          language,
          task_type: taskType,
          problem: {
            title: problemTitle,
            description: problemDescription,
            constraints: problemConstraints
          },
          code_submission: input,
          user_history: [],
          attempt_count: 1,
          last_error: ''
        })
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
  const handleAICall = (taskType: 'hint' | 'feedback' | 'explain') => {
    setAiTab(taskType);
    setActiveTab(taskType);
    setAiResponse(null);
  };

  // Handler for submitting problem details modal
  const handleProblemModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingTaskType) return;
    setProblemModalOpen(false);
    doAICall(pendingTaskType);
    setPendingTaskType(null);
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
            <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 w-auto">
              <TabsTrigger value="input">Input</TabsTrigger>
              <TabsTrigger value="output">Output</TabsTrigger>
              <TabsTrigger value="hint">Hint</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
              <TabsTrigger value="explain">Explain</TabsTrigger>
            </TabsList>
            {/* AI Feature Tags */}
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
              <form
                className="space-y-3 max-w-xl mx-auto"
                onSubmit={e => {
                  e.preventDefault();
                  doAICall('hint');
                }}
              >
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-base font-semibold placeholder:text-blue-400"
                  placeholder="Problem Title (e.g. Two Sum)"
                  value={problemTitle}
                  onChange={e => setProblemTitle(e.target.value)}
                  required
                />
                <textarea
                  className="w-full px-3 py-2 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-sm placeholder:text-blue-400"
                  placeholder="Problem Description"
                  value={problemDescription}
                  onChange={e => setProblemDescription(e.target.value)}
                  rows={2}
                  required
                />
                <div>
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 rounded border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white text-sm placeholder:text-purple-400"
                      placeholder="Add a constraint and press Enter"
                      value={constraintInput}
                      onChange={e => setConstraintInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && constraintInput.trim()) {
                          setProblemConstraints([...problemConstraints, constraintInput.trim()]);
                          setConstraintInput('');
                          e.preventDefault();
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {problemConstraints.map((c, i) => (
                      <span key={i} className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium flex items-center gap-1">
                        {c}
                        <button
                          type="button"
                          className="ml-1 text-purple-400 hover:text-purple-700"
                          onClick={() => setProblemConstraints(problemConstraints.filter((_, idx) => idx !== i))}
                          aria-label="Remove constraint"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full mt-2 px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow"
                  disabled={aiLoading}
                >
                  {aiLoading ? 'Loading...' : 'Get Hint'}
                </button>
              </form>
              {aiResponse && (
                <div className="prose max-w-full whitespace-pre-wrap mt-4 border-t pt-4">{aiResponse}</div>
              )}
            </TabsContent>
            <TabsContent value="feedback" className="h-full m-0 p-4">
              <form
                className="space-y-3 max-w-xl mx-auto"
                onSubmit={e => {
                  e.preventDefault();
                  doAICall('feedback');
                }}
              >
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-base font-semibold placeholder:text-blue-400"
                  placeholder="Problem Title (e.g. Two Sum)"
                  value={problemTitle}
                  onChange={e => setProblemTitle(e.target.value)}
                  required
                />
                <textarea
                  className="w-full px-3 py-2 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-sm placeholder:text-blue-400"
                  placeholder="Problem Description"
                  value={problemDescription}
                  onChange={e => setProblemDescription(e.target.value)}
                  rows={2}
                  required
                />
                <div>
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 rounded border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white text-sm placeholder:text-purple-400"
                      placeholder="Add a constraint and press Enter"
                      value={constraintInput}
                      onChange={e => setConstraintInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && constraintInput.trim()) {
                          setProblemConstraints([...problemConstraints, constraintInput.trim()]);
                          setConstraintInput('');
                          e.preventDefault();
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {problemConstraints.map((c, i) => (
                      <span key={i} className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium flex items-center gap-1">
                        {c}
                        <button
                          type="button"
                          className="ml-1 text-purple-400 hover:text-purple-700"
                          onClick={() => setProblemConstraints(problemConstraints.filter((_, idx) => idx !== i))}
                          aria-label="Remove constraint"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full mt-2 px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors shadow"
                  disabled={aiLoading}
                >
                  {aiLoading ? 'Loading...' : 'Get Feedback'}
                </button>
              </form>
              {aiResponse && (
                <div className="prose max-w-full whitespace-pre-wrap mt-4 border-t pt-4">{aiResponse}</div>
              )}
            </TabsContent>
            <TabsContent value="explain" className="h-full m-0 p-4">
              <form
                className="space-y-3 max-w-xl mx-auto"
                onSubmit={e => {
                  e.preventDefault();
                  doAICall('explain');
                }}
              >
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-base font-semibold placeholder:text-blue-400"
                  placeholder="Problem Title (e.g. Two Sum)"
                  value={problemTitle}
                  onChange={e => setProblemTitle(e.target.value)}
                  required
                />
                <textarea
                  className="w-full px-3 py-2 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-sm placeholder:text-blue-400"
                  placeholder="Problem Description"
                  value={problemDescription}
                  onChange={e => setProblemDescription(e.target.value)}
                  rows={2}
                  required
                />
                <div>
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 rounded border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white text-sm placeholder:text-purple-400"
                      placeholder="Add a constraint and press Enter"
                      value={constraintInput}
                      onChange={e => setConstraintInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && constraintInput.trim()) {
                          setProblemConstraints([...problemConstraints, constraintInput.trim()]);
                          setConstraintInput('');
                          e.preventDefault();
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {problemConstraints.map((c, i) => (
                      <span key={i} className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium flex items-center gap-1">
                        {c}
                        <button
                          type="button"
                          className="ml-1 text-purple-400 hover:text-purple-700"
                          onClick={() => setProblemConstraints(problemConstraints.filter((_, idx) => idx !== i))}
                          aria-label="Remove constraint"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full mt-2 px-4 py-2 rounded bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors shadow"
                  disabled={aiLoading}
                >
                  {aiLoading ? 'Loading...' : 'Get Explanation'}
                </button>
              </form>
              {aiResponse && (
                <div className="prose max-w-full whitespace-pre-wrap mt-4 border-t pt-4">{aiResponse}</div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
      {/* AI Response Modal */}
      <Dialog open={aiModalOpen} onOpenChange={setAiModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Agent Response</DialogTitle>
          </DialogHeader>
          <div className="prose max-w-full whitespace-pre-wrap">
            {aiLoading ? 'Loading...' : aiResponse}
          </div>
        </DialogContent>
      </Dialog>
      {/* Problem Details Modal */}
      <Dialog open={problemModalOpen} onOpenChange={setProblemModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Problem Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProblemModalSubmit} className="space-y-3">
            <input
              type="text"
              className="w-full px-3 py-2 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-base font-semibold placeholder:text-blue-400"
              placeholder="Problem Title (e.g. Two Sum)"
              value={problemTitle}
              onChange={e => setProblemTitle(e.target.value)}
              required
            />
            <textarea
              className="w-full px-3 py-2 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-sm placeholder:text-blue-400"
              placeholder="Problem Description"
              value={problemDescription}
              onChange={e => setProblemDescription(e.target.value)}
              rows={2}
              required
            />
            <div>
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <input
                  ref={constraintInputRef}
                  type="text"
                  className="flex-1 px-3 py-2 rounded border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white text-sm placeholder:text-purple-400"
                  placeholder="Add a constraint and press Enter"
                  value={constraintInput}
                  onChange={e => setConstraintInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && constraintInput.trim()) {
                      setProblemConstraints([...problemConstraints, constraintInput.trim()]);
                      setConstraintInput('');
                      e.preventDefault();
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {problemConstraints.map((c, i) => (
                  <span key={i} className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium flex items-center gap-1">
                    {c}
                    <button
                      type="button"
                      className="ml-1 text-purple-400 hover:text-purple-700"
                      onClick={() => setProblemConstraints(problemConstraints.filter((_, idx) => idx !== i))}
                      aria-label="Remove constraint"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-2 px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow"
            >
              Continue
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default InputOutput;
