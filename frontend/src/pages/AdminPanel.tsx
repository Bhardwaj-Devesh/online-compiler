import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  Users, 
  BookOpen, 
  TrendingUp,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Problem {
  id: string;
  title: string;
  problem_statement: string;
  topic_tags: string[];
  created_at: string;
}

const AdminPanel = () => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('problems');
  
  // Form state for adding new problem
  const [newProblem, setNewProblem] = useState({
    title: '',
    problem_statement: '',
    constraints: '',
    examples: [{ input: '', output: '' }],
    topic_tags: ['']
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel.",
        variant: "destructive",
      });
      return;
    }
    
    fetchProblems();
  }, [user]);

  const fetchProblems = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/problems', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProblems(data.problems);
      }
    } catch (error) {
      console.error('Failed to fetch problems:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!newProblem.title || !newProblem.problem_statement || !newProblem.constraints) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/problems', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newProblem,
          topic_tags: newProblem.topic_tags.filter(tag => tag.trim() !== '')
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Problem added successfully!",
        });
        
        // Reset form
        setNewProblem({
          title: '',
          problem_statement: '',
          constraints: '',
          examples: [{ input: '', output: '' }],
          topic_tags: ['']
        });
        
        // Refresh problems list
        fetchProblems();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Failed to add problem",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Add problem error:', error);
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProblem = async (problemId: string) => {
    if (!confirm('Are you sure you want to delete this problem?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/problems/${problemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Problem deleted successfully!",
        });
        fetchProblems();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete problem",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Delete problem error:', error);
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addExample = () => {
    setNewProblem(prev => ({
      ...prev,
      examples: [...prev.examples, { input: '', output: '' }]
    }));
  };

  const removeExample = (index: number) => {
    setNewProblem(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index)
    }));
  };

  const updateExample = (index: number, field: 'input' | 'output', value: string) => {
    setNewProblem(prev => ({
      ...prev,
      examples: prev.examples.map((example, i) => 
        i === index ? { ...example, [field]: value } : example
      )
    }));
  };

  const addTopicTag = () => {
    setNewProblem(prev => ({
      ...prev,
      topic_tags: [...prev.topic_tags, '']
    }));
  };

  const removeTopicTag = (index: number) => {
    setNewProblem(prev => ({
      ...prev,
      topic_tags: prev.topic_tags.filter((_, i) => i !== index)
    }));
  };

  const updateTopicTag = (index: number, value: string) => {
    setNewProblem(prev => ({
      ...prev,
      topic_tags: prev.topic_tags.map((tag, i) => i === index ? value : tag)
    }));
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access the admin panel.
          </p>
          <Button asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading admin panel...</p>
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
            <div>
              <h1 className="text-3xl font-bold">Admin Panel</h1>
              <p className="text-muted-foreground">
                Manage problems and view platform statistics
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button asChild variant="outline">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button asChild>
                <Link to="/problems">View Problems</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="problems">Manage Problems</TabsTrigger>
            <TabsTrigger value="add-problem">Add Problem</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          {/* Manage Problems Tab */}
          <TabsContent value="problems" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Problems Management</h2>
              <Button onClick={() => setActiveTab('add-problem')}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Problem
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {problems.map((problem) => (
                <Card key={problem.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{problem.title}</CardTitle>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {problem.topic_tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {problem.problem_statement.replace(/[#*`]/g, '').substring(0, 100)}...
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(problem.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/problem/${problem.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeleteProblem(problem.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Add Problem Tab */}
          <TabsContent value="add-problem" className="space-y-6">
            <h2 className="text-2xl font-bold">Add New Problem</h2>
            
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleAddProblem} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Problem Title *</Label>
                    <Input
                      id="title"
                      value={newProblem.title}
                      onChange={(e) => setNewProblem(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter problem title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="statement">Problem Statement *</Label>
                    <Textarea
                      id="statement"
                      value={newProblem.problem_statement}
                      onChange={(e) => setNewProblem(prev => ({ ...prev, problem_statement: e.target.value }))}
                      placeholder="Enter problem statement (markdown supported)"
                      rows={6}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="constraints">Constraints *</Label>
                    <Textarea
                      id="constraints"
                      value={newProblem.constraints}
                      onChange={(e) => setNewProblem(prev => ({ ...prev, constraints: e.target.value }))}
                      placeholder="Enter problem constraints"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Examples</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addExample}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Example
                      </Button>
                    </div>
                    
                    {newProblem.examples.map((example, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Example {index + 1}</h4>
                          {newProblem.examples.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExample(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Input</Label>
                            <Input
                              value={example.input}
                              onChange={(e) => updateExample(index, 'input', e.target.value)}
                              placeholder="Enter input"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Output</Label>
                            <Input
                              value={example.output}
                              onChange={(e) => updateExample(index, 'output', e.target.value)}
                              placeholder="Enter expected output"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Topic Tags</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addTopicTag}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Tag
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {newProblem.topic_tags.map((tag, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={tag}
                            onChange={(e) => updateTopicTag(index, e.target.value)}
                            placeholder="Enter topic tag"
                            className="w-32"
                          />
                          {newProblem.topic_tags.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTopicTag(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1">
                      Add Problem
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setActiveTab('problems')}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-6">
            <h2 className="text-2xl font-bold">Platform Statistics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Problems</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{problems.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Available problems
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Topics Covered</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Array.from(new Set(problems.flatMap(p => p.topic_tags))).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Different topics
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Admin Actions</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">
                    Available actions
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest platform activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 border rounded-lg">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium">New problem added</p>
                      <p className="text-sm text-muted-foreground">Maximum Subarray problem was created</p>
                    </div>
                    <span className="text-sm text-muted-foreground">2 days ago</span>
                  </div>
                  
                  <div className="flex items-center gap-4 p-3 border rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium">User registration</p>
                      <p className="text-sm text-muted-foreground">New user joined the platform</p>
                    </div>
                    <span className="text-sm text-muted-foreground">3 days ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel; 