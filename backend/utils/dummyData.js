import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// Dummy users data
export const users = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'user',
    created_at: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Admin User',
    email: 'admin@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'admin',
    created_at: new Date('2024-01-01')
  }
];

// Dummy problems data
export const problems = [
  {
    id: '1',
    title: 'Two Sum',
    problem_statement: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have ***exactly one solution***, and you may not use the *same* element twice.

You can return the answer in any order.

**Example 1:**
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\`

**Example 3:**
\`\`\`
Input: nums = [3,3], target = 6
Output: [0,1]
\`\`\``,
    input_path: 'problems/1/input.txt',
    output_path: 'problems/1/output.txt',
    constraints: '- 2 <= nums.length <= 104\n- -109 <= nums[i] <= 109\n- -109 <= target <= 109\n- Only one valid answer exists.',
    examples: [
      { input: '[2,7,11,15]\n9', output: '[0,1]' },
      { input: '[3,2,4]\n6', output: '[1,2]' },
      { input: '[3,3]\n6', output: '[0,1]' }
    ],
    topic_tags: ['Arrays', 'Hash Table'],
    created_by: '2',
    created_at: new Date('2024-01-01')
  },
  {
    id: '2',
    title: 'Valid Parentheses',
    problem_statement: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:

1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

**Example 1:**
\`\`\`
Input: s = "()"
Output: true
\`\`\`

**Example 2:**
\`\`\`
Input: s = "()[]{}"
Output: true
\`\`\`

**Example 3:**
\`\`\`
Input: s = "(]"
Output: false
\`\`\``,
    input_path: 'problems/2/input.txt',
    output_path: 'problems/2/output.txt',
    constraints: '- 1 <= s.length <= 104\n- s consists of parentheses only \'()[]{}\'',
    examples: [
      { input: '()', output: 'true' },
      { input: '()[]{}', output: 'true' },
      { input: '(]', output: 'false' }
    ],
    topic_tags: ['Stack', 'String'],
    created_by: '2',
    created_at: new Date('2024-01-02')
  },
  {
    id: '3',
    title: 'Maximum Subarray',
    problem_statement: `Given an integer array \`nums\`, find the subarray with the largest sum, and return *its sum*.

**Example 1:**
\`\`\`
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: The subarray [4,-1,2,1] has the largest sum 6.
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [1]
Output: 1
\`\`\`

**Example 3:**
\`\`\`
Input: nums = [5,4,-1,7,8]
Output: 23
\`\`\``,
    input_path: 'problems/3/input.txt',
    output_path: 'problems/3/output.txt',
    constraints: '- 1 <= nums.length <= 105\n- -104 <= nums[i] <= 104',
    examples: [
      { input: '[-2,1,-3,4,-1,2,1,-5,4]', output: '6' },
      { input: '[1]', output: '1' },
      { input: '[5,4,-1,7,8]', output: '23' }
    ],
    topic_tags: ['Dynamic Programming', 'Arrays'],
    created_by: '2',
    created_at: new Date('2024-01-03')
  }
];

// Dummy submissions data
export const submissions = [
  {
    id: '1',
    user_id: '1',
    problem_id: '1',
    code: 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}',
    language: 'javascript',
    input: '[2,7,11,15]\n9',
    output: '[0,1]',
    status: 'Success',
    created_at: new Date('2024-01-15')
  },
  {
    id: '2',
    user_id: '1',
    problem_id: '2',
    code: 'function isValid(s) {\n  const stack = [];\n  const pairs = {\n    \')\': \'(\',\n    \'}\': \'{\',\n    \']\': \'[\'\n  };\n  \n  for (let char of s) {\n    if (char in pairs) {\n      if (stack.pop() !== pairs[char]) return false;\n    } else {\n      stack.push(char);\n    }\n  }\n  \n  return stack.length === 0;\n}',
    language: 'javascript',
    input: '()[]{}',
    output: 'true',
    status: 'Success',
    created_at: new Date('2024-01-16')
  },
  {
    id: '3',
    user_id: '1',
    problem_id: '3',
    code: 'function maxSubArray(nums) {\n  let maxSum = nums[0];\n  let currentSum = nums[0];\n  \n  for (let i = 1; i < nums.length; i++) {\n    currentSum = Math.max(nums[i], currentSum + nums[i]);\n    maxSum = Math.max(maxSum, currentSum);\n  }\n  \n  return maxSum;\n}',
    language: 'javascript',
    input: '[-2,1,-3,4,-1,2,1,-5,4]',
    output: '6',
    status: 'Success',
    created_at: new Date('2024-01-17')
  }
];

// Helper functions
export const findUserByEmail = (email) => {
  return users.find(user => user.email === email);
};

export const findUserById = (id) => {
  return users.find(user => user.id === id);
};

export const findProblemById = (id) => {
  return problems.find(problem => problem.id === id);
};

export const getUserSubmissions = (userId) => {
  return submissions.filter(submission => submission.user_id === userId);
};

export const getSubmissionsByProblem = (problemId) => {
  return submissions.filter(submission => submission.problem_id === problemId);
};

export const addUser = (userData) => {
  const newUser = {
    id: uuidv4(),
    ...userData,
    created_at: new Date()
  };
  users.push(newUser);
  return newUser;
};

export const addProblem = (problemData) => {
  const newProblem = {
    id: uuidv4(),
    ...problemData,
    created_at: new Date()
  };
  problems.push(newProblem);
  return newProblem;
};

export const addSubmission = (submissionData) => {
  const newSubmission = {
    id: uuidv4(),
    ...submissionData,
    created_at: new Date()
  };
  submissions.push(newSubmission);
  return newSubmission;
};

export const getTopicStats = (userId) => {
  const userSubmissions = getUserSubmissions(userId);
  const topicStats = {};
  
  userSubmissions.forEach(submission => {
    if (submission.status === 'Success') {
      const problem = findProblemById(submission.problem_id);
      if (problem) {
        problem.topic_tags.forEach(topic => {
          topicStats[topic] = (topicStats[topic] || 0) + 1;
        });
      }
    }
  });
  
  return Object.entries(topicStats).map(([topic, count]) => ({
    topic,
    count
  }));
}; 