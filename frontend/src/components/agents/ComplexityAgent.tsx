import MarkdownRenderer from '@/components/ui/markdown-renderer';

interface ComplexityAgentProps {
  language: string;
  code: string;
  aiLoading: boolean;
  aiResponse: string | null;
  onAICall: (taskType: 'hint' | 'feedback' | 'explain' | 'complexity', problemData?: { title: string; description: string; constraints: string[] }) => Promise<void>;
}

const ComplexityAgent = ({ language, code, aiLoading, aiResponse, onAICall }: ComplexityAgentProps) => {
  const handleAnalyzeComplexity = () => {
    onAICall('complexity');
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">Code Complexity Analysis</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Analyze the time and space complexity of your code
        </p>
        <button
          onClick={handleAnalyzeComplexity}
          disabled={aiLoading || !code.trim()}
          className="px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors"
        >
          {aiLoading ? 'Analyzing...' : 'Analyze Complexity'}
        </button>
      </div>
      
      {aiResponse && (
        <div className="mt-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <MarkdownRenderer content={aiResponse} />
        </div>
      )}
    </div>
  );
};

export default ComplexityAgent; 
