import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InputOutputProps {
  input: string;
  onInputChange: (input: string) => void;
  output: string;
  isRunning: boolean;
  fontFamily: string;
}

const InputOutput = ({ input, onInputChange, output, isRunning, fontFamily }: InputOutputProps) => {
  const { toast } = useToast();

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
        <Tabs defaultValue="input" className="h-full flex flex-col">
          <div className="border-b border-editor-border p-4 bg-gradient-surface">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="input">Input</TabsTrigger>
              <TabsTrigger value="output">Output</TabsTrigger>
            </TabsList>
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
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default InputOutput;