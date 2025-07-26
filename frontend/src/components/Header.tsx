import { Button } from '@/components/ui/button';
import { Code2, Github } from 'lucide-react';
import { Badge } from '@/components/ui/badge';


const Header = () => {
  return (
    <header className="border-b border-editor-border bg-gradient-surface">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Code2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                CodeFlow
              </h1>
              <p className="text-sm text-muted-foreground">
                Online Code Compiler
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="font-jetbrains">
            v1.0.0
          </Badge>
        </div>

        <div className="flex items-center gap-3">

          <Button
            variant="outline"
            size="sm"
            asChild
            className="gap-2"
          >
            <a 
              href="https://github.com/Bhardwaj-Devesh" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;