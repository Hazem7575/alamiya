import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Palette, RotateCcw } from 'lucide-react';

const colorThemes = [
  {
    name: 'Purple Dream',
    primary: '280 100% 70%',
    secondary: '217 91% 60%',
    accent: '142 76% 36%',
    preview: 'bg-gradient-to-r from-purple-500 to-blue-500'
  },
  {
    name: 'Ocean Breeze',
    primary: '217 91% 60%',
    secondary: '195 100% 50%',
    accent: '174 72% 56%',
    preview: 'bg-gradient-to-r from-blue-500 to-cyan-500'
  },
  {
    name: 'Sunset Glow',
    primary: '25 95% 53%',
    secondary: '330 81% 60%',
    accent: '0 72% 51%',
    preview: 'bg-gradient-to-r from-orange-500 to-pink-500'
  },
  {
    name: 'Forest Green',
    primary: '142 76% 36%',
    secondary: '120 60% 50%',
    accent: '60 100% 50%',
    preview: 'bg-gradient-to-r from-green-600 to-lime-500'
  },
  {
    name: 'Royal Purple',
    primary: '260 60% 50%',
    secondary: '280 100% 70%',
    accent: '300 76% 56%',
    preview: 'bg-gradient-to-r from-purple-700 to-purple-400'
  },
  {
    name: 'Cyber Blue',
    primary: '200 100% 50%',
    secondary: '180 100% 40%',
    accent: '160 100% 50%',
    preview: 'bg-gradient-to-r from-cyan-500 to-teal-500'
  }
];

const defaultTheme = colorThemes[0];

export const ColorSettings = () => {
  const [selectedTheme, setSelectedTheme] = useState(defaultTheme);
  const [isApplied, setIsApplied] = useState(false);

  const applyTheme = (theme: typeof defaultTheme) => {
    const root = document.documentElement;
    root.style.setProperty('--primary-brand', theme.primary);
    root.style.setProperty('--secondary-brand', theme.secondary);
    root.style.setProperty('--accent-brand', theme.accent);
    
    // Update derived colors
    root.style.setProperty('--gradient-primary', `linear-gradient(135deg, hsl(${theme.primary}), hsl(${theme.secondary}))`);
    root.style.setProperty('--gradient-accent', `linear-gradient(45deg, hsl(${theme.accent}), hsl(${theme.primary}))`);
    root.style.setProperty('--shadow-elegant', `0 10px 30px -10px hsl(${theme.primary} / 0.3)`);
    root.style.setProperty('--shadow-glow', `0 0 40px hsl(${theme.primary} / 0.15)`);
    root.style.setProperty('--hover-primary', `hsl(${theme.primary} / 0.1)`);
    root.style.setProperty('--hover-secondary', `hsl(${theme.secondary} / 0.1)`);
    root.style.setProperty('--hover-accent', `hsl(${theme.accent} / 0.1)`);
    
    setSelectedTheme(theme);
    setIsApplied(true);
    
    // Store in localStorage
    localStorage.setItem('colorTheme', JSON.stringify(theme));
    
    setTimeout(() => setIsApplied(false), 2000);
  };

  const resetToDefault = () => {
    applyTheme(defaultTheme);
    localStorage.removeItem('colorTheme');
  };

  useEffect(() => {
    // Load saved theme on mount
    const savedTheme = localStorage.getItem('colorTheme');
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme);
        applyTheme(theme);
      } catch (e) {
        console.error('Failed to load saved theme:', e);
      }
    }
  }, []);

  return (
    <Card className="border-0 shadow-card">
      <CardHeader className="bg-gradient-primary text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl">Color Themes</CardTitle>
            <CardDescription className="text-white/80">
              Customize your app's appearance with beautiful color schemes
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Current Theme Display */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-subtle border">
            <div>
              <h3 className="font-semibold text-foreground">Current Theme</h3>
              <p className="text-sm text-muted-foreground">{selectedTheme.name}</p>
            </div>
            <div className="flex items-center gap-2">
              {isApplied && (
                <Badge variant="secondary" className="bg-gradient-accent text-white">
                  Applied!
                </Badge>
              )}
              <div className={`w-12 h-8 rounded-md ${selectedTheme.preview} shadow-elegant`} />
            </div>
          </div>

          {/* Theme Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colorThemes.map((theme, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-elegant ${
                  selectedTheme.name === theme.name
                    ? 'border-[--primary-brand] bg-[--hover-primary]'
                    : 'border-border hover:border-[--primary-brand]/50'
                }`}
                onClick={() => applyTheme(theme)}
              >
                <div className="space-y-3">
                  <div className={`w-full h-16 rounded-md ${theme.preview} shadow-card`} />
                  <div>
                    <h4 className="font-medium text-foreground">{theme.name}</h4>
                    <div className="flex gap-1 mt-2">
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: `hsl(${theme.primary})` }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: `hsl(${theme.secondary})` }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: `hsl(${theme.accent})` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Reset Button */}
          <div className="flex justify-center pt-4">
            <Button 
              variant="outline" 
              onClick={resetToDefault}
              className="hover:bg-[--hover-primary] transition-all duration-300"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};