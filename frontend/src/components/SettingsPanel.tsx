import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Moon, Sun, Palette, Type } from 'lucide-react';

interface SettingsPanelProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  fontFamily: string;
  onFontFamilyChange: (font: string) => void;
}

const fonts = [
  { value: 'Fira Code', label: 'Fira Code', family: 'font-fira' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono', family: 'font-jetbrains' },
  { value: 'Source Code Pro', label: 'Source Code Pro', family: 'font-source' },
  { value: 'Courier New', label: 'Courier New', family: 'font-courier' },
];

const SettingsPanel = ({ theme, onThemeChange, fontFamily, onFontFamilyChange }: SettingsPanelProps) => {
  return (
    <Card className="shadow-card-custom">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Theme</label>
          <div className="flex gap-2">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onThemeChange('light')}
              className="flex-1 gap-2"
            >
              <Sun className="h-4 w-4" />
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onThemeChange('dark')}
              className="flex-1 gap-2"
            >
              <Moon className="h-4 w-4" />
              Dark
            </Button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <Type className="h-4 w-4" />
            Font Family
          </label>
          <Select value={fontFamily} onValueChange={onFontFamilyChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              {fonts.map((font) => (
                <SelectItem 
                  key={font.value} 
                  value={font.value}
                  className={font.family}
                >
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Choose your preferred coding environment with custom themes and fonts.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsPanel;