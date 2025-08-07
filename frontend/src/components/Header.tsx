import { Button } from '@/components/ui/button';
import { Code2, Github, User, LogOut, Settings, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();

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
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/">Code Editor</Link>
            </Button>
            {isAuthenticated && (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/problems">Problems</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                {user?.role === 'admin' && (
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/admin">Admin</Link>
                  </Button>
                )}
              </>
            )}
          </div>

          {/* GitHub Link */}
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

          {/* Authentication */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  {user?.name}
                  {user?.role === 'admin' && (
                    <Badge variant="destructive" className="text-xs">
                      Admin
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/problems" className="flex items-center gap-2">
                    <Code2 className="h-4 w-4" />
                    Problems
                  </Link>
                </DropdownMenuItem>
                {user?.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;