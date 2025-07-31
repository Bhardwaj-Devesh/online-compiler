import { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface ProblemFormProps {
  onSubmit: (problemData: {
    title: string;
    description: string;
    constraints: string[];
  }) => void;
  buttonText: string;
  buttonColor: string;
  isLoading: boolean;
}

const ProblemForm = ({ onSubmit, buttonText, buttonColor, isLoading }: ProblemFormProps) => {
  const [problemTitle, setProblemTitle] = useState<string>('');
  const [problemDescription, setProblemDescription] = useState<string>('');
  const [problemConstraints, setProblemConstraints] = useState<string[]>([]);
  const [constraintInput, setConstraintInput] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: problemTitle,
      description: problemDescription,
      constraints: problemConstraints
    });
  };

  const addConstraint = () => {
    if (constraintInput.trim()) {
      setProblemConstraints([...problemConstraints, constraintInput.trim()]);
      setConstraintInput('');
    }
  };

  const removeConstraint = (index: number) => {
    setProblemConstraints(problemConstraints.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addConstraint();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Problem Title
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            placeholder="e.g., Two Sum, Valid Parentheses"
            value={problemTitle}
            onChange={e => setProblemTitle(e.target.value)}
            required
          />
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Problem Description
          </label>
          <textarea
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
            placeholder="Describe the problem and what needs to be solved..."
            value={problemDescription}
            onChange={e => setProblemDescription(e.target.value)}
            rows={4}
            required
          />
        </div>

        {/* Constraints Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Constraints
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="e.g., 1 ≤ nums.length ≤ 10⁴"
              value={constraintInput}
              onChange={e => setConstraintInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              onClick={addConstraint}
              disabled={!constraintInput.trim()}
              className="px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          {/* Constraints Tags */}
          {problemConstraints.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {problemConstraints.map((constraint, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 text-sm font-medium rounded-full border border-purple-200"
                >
                  {constraint}
                  <button
                    type="button"
                    onClick={() => removeConstraint(index)}
                    className="text-purple-400 hover:text-purple-600 transition-colors"
                    aria-label="Remove constraint"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !problemTitle.trim() || !problemDescription.trim()}
          className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${buttonColor}`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </div>
          ) : (
            buttonText
          )}
        </button>
      </form>
    </div>
  );
};

export default ProblemForm; 
