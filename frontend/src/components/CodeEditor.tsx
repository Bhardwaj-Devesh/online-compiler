import Editor from '@monaco-editor/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Copy, Download, Settings as SettingsIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CodeEditorProps {
  language: string;
  onLanguageChange: (language: string) => void;
  code: string;
  onCodeChange: (code: string) => void;
  onRun: () => void;
  theme: 'light' | 'dark';
  fontFamily: string;
 
}

const languages = [
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' }
];

const CodeEditor = ({ 
  language, 
  onLanguageChange, 
  code, 
  onCodeChange, 
  onRun,
  theme,
  fontFamily, // Add prop
}: CodeEditorProps) => {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Code copied!",
        description: "Your code has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy code to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const extension = language === 'cpp' ? 'cpp' : language === 'python' ? 'py' : 'js';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="h-full shadow-editor">
      <CardContent className="p-0">
        <div className="border-b border-editor-border p-4 bg-gradient-surface">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Select value={language} onValueChange={onLanguageChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                
              </Button>
              
              <Button
                onClick={onRun}
                className="gap-2 bg-gradient-primary hover:opacity-90"
              >
                <Play className="h-4 w-4" />
                Run Code
              </Button>
            </div>
          </div>
        </div>
        
        <div className="h-[calc(100vh-200px)]">
          <Editor
            language={language}
            value={code}
            onChange={(value) => onCodeChange(value || '')}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            options={{
              fontFamily,
              fontSize: 14,
              lineHeight: 1.5,
              fontLigatures: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              wordWrap: 'on',
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnCommitCharacter: true,
              acceptSuggestionOnEnter: 'on',
              quickSuggestions: true,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CodeEditor;
