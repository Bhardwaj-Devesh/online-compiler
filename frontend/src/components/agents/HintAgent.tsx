import ProblemForm from './ProblemForm';
import MarkdownRenderer from '@/components/ui/markdown-renderer';

interface HintAgentProps {
  language: string;
  input: string;
  aiLoading: boolean;
  aiResponse: string | null;
  onAICall: (taskType: 'hint' | 'feedback' | 'explain' | 'complexity', problemData?: { title: string; description: string; constraints: string[] }) => Promise<void>;
}

const HintAgent = ({ language, input, aiLoading, aiResponse, onAICall }: HintAgentProps) => {
  const handleSubmit = (problemData: { title: string; description: string; constraints: string[] }) => {
    onAICall('hint', problemData);
  };

  return (
    <div>
      <ProblemForm
        onSubmit={handleSubmit}
        buttonText="Get Hint"
        buttonColor="bg-blue-600 hover:bg-blue-700"
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

export default HintAgent; 
