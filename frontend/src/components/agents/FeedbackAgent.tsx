import ProblemForm from './ProblemForm';
import MarkdownRenderer from '@/components/ui/markdown-renderer';

interface FeedbackAgentProps {
  language: string;
  input: string;
  aiLoading: boolean;
  aiResponse: string | null;
  onAICall: (taskType: 'hint' | 'feedback' | 'explain' | 'complexity', problemData?: { title: string; description: string; constraints: string[] }) => Promise<void>;
}

const FeedbackAgent = ({ language, input, aiLoading, aiResponse, onAICall }: FeedbackAgentProps) => {
  const handleSubmit = (problemData: { title: string; description: string; constraints: string[] }) => {
    onAICall('feedback', problemData);
  };

  return (
    <div>
      <ProblemForm
        onSubmit={handleSubmit}
        buttonText="Get Feedback"
        buttonColor="bg-green-600 hover:bg-green-700"
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

export default FeedbackAgent; 
