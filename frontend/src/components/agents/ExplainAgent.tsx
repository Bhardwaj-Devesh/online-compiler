import ProblemForm from './ProblemForm';
import MarkdownRenderer from '@/components/ui/markdown-renderer';

interface ExplainAgentProps {
  language: string;
  input: string;
  aiLoading: boolean;
  aiResponse: string | null;
  onAICall: (taskType: 'hint' | 'feedback' | 'explain' | 'complexity', problemData?: { title: string; description: string; constraints: string[] }) => Promise<void>;
}

const ExplainAgent = ({ language, input, aiLoading, aiResponse, onAICall }: ExplainAgentProps) => {
  const handleSubmit = (problemData: { title: string; description: string; constraints: string[] }) => {
    onAICall('explain', problemData);
  };

  return (
    <div>
      <ProblemForm
        onSubmit={handleSubmit}
        buttonText="Get Explanation"
        buttonColor="bg-purple-600 hover:bg-purple-700"
        isLoading={aiLoading}
      />
      {aiResponse && (
        <div className="mt-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <MarkdownRenderer content={aiResponse} />
        </div>
      )}
    </div>
  );
};

export default ExplainAgent; 
