import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { db, doc, updateDoc, getDoc } from '@/lib/firebase';
import { Restaurant, MenuTheme } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, RotateCcw, Loader2, AlertCircle, RefreshCcw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ThemeBuilder = () => {
  const { currentUser } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const [hasChanges, setHasChanges] = useState(false);
  const [originalTheme, setOriginalTheme] = useState<MenuTheme | null>(null);

  const defaultTheme: MenuTheme = {
    primary: '#0da98a',       // hsl(170, 94%, 27%) equivalent
    secondary: '#3a9f86',     // hsl(170, 94%, 27%) equivalent
    accent: '#f5c11a',        // hsl(44, 88%, 51%) equivalent
    background: '#fefbf2',    // hsl(50, 75%, 98%) equivalent
    card: '#f0f4f2',         // hsl(150, 13%, 94%) equivalent
    border: '#b8d3ab',       // hsl(109, 22%, 75%) equivalent
    text: {
      primary: '#262626',     // hsl(0, 1%, 15%) equivalent
      secondary: '#737373',   // hsl(0, 1%, 45%) equivalent
      accent: '#fefbf2'       // hsl(50, 75%, 98%) equivalent
    },
    price: '#f5c11a'         // hsl(44, 88%, 51%) equivalent
  };

  const [theme, setTheme] = useState<MenuTheme>(defaultTheme);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!currentUser?.uid) return;
      
      try {
        const restaurantDoc = await getDoc(doc(db, 'restaurants', currentUser.uid));
        if (restaurantDoc.exists()) {
          const data = restaurantDoc.data() as Restaurant;
          setRestaurant(data);
          const savedTheme = data.theme || defaultTheme;
          setTheme(savedTheme);
          setOriginalTheme(savedTheme);
        }
      } catch (error) {
        console.error('Error fetching restaurant:', error);
        toast({
          title: 'Error',
          description: 'Failed to load restaurant data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [currentUser?.uid]);

  // Check for changes whenever theme is updated
  useEffect(() => {
    if (originalTheme) {
      const themeChanged = JSON.stringify(theme) !== JSON.stringify(originalTheme);
      setHasChanges(themeChanged);
    }
  }, [theme, originalTheme]);

  const handleSave = async () => {
    if (!currentUser?.uid) return;
    
    setSaving(true);
    try {
      const restaurantRef = doc(db, 'restaurants', currentUser.uid);
      await updateDoc(restaurantRef, {
        theme: theme,
        lastUpdated: new Date().toISOString()
      });
      
      setOriginalTheme(theme);
      setHasChanges(false);
      
      toast({
        title: 'Success',
        description: 'Theme settings saved successfully',
      });
    } catch (error) {
      console.error('Error saving theme:', error);
      toast({
        title: 'Error',
        description: 'Failed to save theme settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setTheme(defaultTheme);
    setHasChanges(true);
  };

  const handleColorChange = (key: string, value: string) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      setTheme(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setTheme(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <RefreshCcw className="h-8 w-8 animate-spin text-black" />
          <p className="mt-4 text-lg text-black">Loading theme builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="flex flex-col mb-8">
        <div className="flex justify-between">
          <div>
            <h1 className="text-4xl font-bold font-display text-black">Theme Builder</h1>
            <p className="text-gray-600 mt-2">
              Customize your menu's appearance and colors
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex flex-col md:flex-row items-end md:items-center gap-3">
              {hasChanges && (
                <Card className="bg-amber-50 border-amber-200">
                  <CardContent className="py-3 px-4 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <p className="text-sm text-amber-700">You have unsaved changes</p>
                  </CardContent>
                </Card>
              )}
              <Button 
                variant="outline" 
                onClick={handleReset} 
                className="flex items-center rounded-lg px-4 py-2 bg-white border-gray-200 hover:bg-gray-50 hover:text-black transition-all duration-200"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Default
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className={`group bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors duration-200 ${saving ? '' : 'group bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors duration-200'}`}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2 group-hover:text-secondary-foreground" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Theme Controls */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Colors</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="primary"
                    value={theme.primary}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    className="w-12 h-12 p-1 rounded-lg"
                  />
                  <Input
                    type="text"
                    value={theme.primary}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="secondary"
                    value={theme.secondary}
                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                    className="w-12 h-12 p-1 rounded-lg"
                  />
                  <Input
                    type="text"
                    value={theme.secondary}
                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accent">Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="accent"
                    value={theme.accent}
                    onChange={(e) => handleColorChange('accent', e.target.value)}
                    className="w-12 h-12 p-1 rounded-lg"
                  />
                  <Input
                    type="text"
                    value={theme.accent}
                    onChange={(e) => handleColorChange('accent', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="background">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="background"
                    value={theme.background}
                    onChange={(e) => handleColorChange('background', e.target.value)}
                    className="w-12 h-12 p-1 rounded-lg"
                  />
                  <Input
                    type="text"
                    value={theme.background}
                    onChange={(e) => handleColorChange('background', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="card">Card Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="card"
                    value={theme.card}
                    onChange={(e) => handleColorChange('card', e.target.value)}
                    className="w-12 h-12 p-1 rounded-lg"
                  />
                  <Input
                    type="text"
                    value={theme.card}
                    onChange={(e) => handleColorChange('card', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="border">Border Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="border"
                    value={theme.border}
                    onChange={(e) => handleColorChange('border', e.target.value)}
                    className="w-12 h-12 p-1 rounded-lg"
                  />
                  <Input
                    type="text"
                    value={theme.border}
                    onChange={(e) => handleColorChange('border', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text.primary">Primary Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="text.primary"
                    value={theme.text.primary}
                    onChange={(e) => handleColorChange('text.primary', e.target.value)}
                    className="w-12 h-12 p-1 rounded-lg"
                  />
                  <Input
                    type="text"
                    value={theme.text.primary}
                    onChange={(e) => handleColorChange('text.primary', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text.secondary">Secondary Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="text.secondary"
                    value={theme.text.secondary}
                    onChange={(e) => handleColorChange('text.secondary', e.target.value)}
                    className="w-12 h-12 p-1 rounded-lg"
                  />
                  <Input
                    type="text"
                    value={theme.text.secondary}
                    onChange={(e) => handleColorChange('text.secondary', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text.accent">Accent Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="text.accent"
                    value={theme.text.accent}
                    onChange={(e) => handleColorChange('text.accent', e.target.value)}
                    className="w-12 h-12 p-1 rounded-lg"
                  />
                  <Input
                    type="text"
                    value={theme.text.accent}
                    onChange={(e) => handleColorChange('text.accent', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="price"
                    value={theme.price}
                    onChange={(e) => handleColorChange('price', e.target.value)}
                    className="w-12 h-12 p-1 rounded-lg"
                  />
                  <Input
                    type="text"
                    value={theme.price}
                    onChange={(e) => handleColorChange('price', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-8">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Preview</h2>
            <div 
              className="rounded-lg overflow-hidden"
              style={{ background: theme.background }}
            >
              {/* Sample Menu Preview */}
              <div className="p-6" style={{ background: theme.background }}>
                {/* Header */}
                <div className="mb-8 text-center">
                  <h1 
                    className="text-4xl font-bold mb-2"
                    style={{ color: theme.text.primary }}
                  >
                    Sample Restaurant
                  </h1>
                  <p 
                    className="text-lg"
                    style={{ color: theme.text.secondary }}
                  >
                    A preview of your menu's appearance
                  </p>
                </div>

                {/* Search Bar */}
                <div 
                  className="mb-8 p-4 rounded-2xl"
                  style={{ 
                    background: theme.card,
                    borderColor: theme.border,
                    borderWidth: '1px',
                    borderStyle: 'solid'
                  }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div 
                      className="flex-1 p-3 rounded-xl"
                      style={{ 
                        background: theme.background,
                        borderColor: theme.border,
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }}
                    >
                      <p style={{ color: theme.text.secondary }}>Search dishes...</p>
                    </div>
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: theme.primary }}
                    >
                      <div style={{ color: theme.text.accent }}>🔍</div>
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div 
                  className="mb-8 p-4 rounded-2xl"
                  style={{ 
                    background: theme.card,
                    borderColor: theme.border,
                    borderWidth: '1px',
                    borderStyle: 'solid'
                  }}
                >
                  <h3 
                    className="text-lg font-bold mb-4"
                    style={{ color: theme.text.primary }}
                  >
                    Menu Categories
                  </h3>
                  <div className="space-y-2">
                    {['Starters', 'Main Course', 'Desserts'].map((category, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-2xl transition-all duration-200"
                        style={{
                          background: index === 0 ? theme.primary : 'transparent',
                          color: index === 0 ? theme.text.accent : theme.text.primary
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{category}</div>
                            <div className="text-sm opacity-60">4 dishes</div>
                          </div>
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ background: theme.accent }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Menu Section */}
                <div className="space-y-6">
                  <div 
                    className="rounded-3xl shadow-xl border overflow-hidden"
                    style={{
                      background: theme.card,
                      borderColor: theme.border
                    }}
                  >
                    {/* Section Header */}
                    <div 
                      className="p-8 flex items-center justify-between"
                      style={{ 
                        background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})`
                      }}
                    >
                      <div className="flex items-center gap-6">
                        <div 
                          className="w-4 h-4 rounded-full shadow-lg"
                          style={{ background: theme.accent }}
                        />
                        <h2 
                          className="text-2xl md:text-3xl font-bold"
                          style={{ color: theme.text.accent }}
                        >
                          Main Course
                        </h2>
                        <span 
                          className="px-4 py-2 rounded-xl text-sm font-semibold shadow-lg"
                          style={{ 
                            background: theme.accent,
                            color: theme.text.accent
                          }}
                        >
                          4 dishes
                        </span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-6 space-y-4">
                      {/* Regular Menu Item */}
                      <div 
                        className="rounded-2xl p-6 border transition-all duration-300"
                        style={{
                          background: theme.background,
                          borderColor: theme.border
                        }}
                      >
                        <div className="flex gap-6">
                          <div 
                            className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg"
                            style={{ 
                              background: theme.accent,
                              border: `2px solid ${theme.border}`
                            }}
                          >
                            <div 
                              className="w-full h-full flex items-center justify-center"
                              style={{ color: theme.text.accent }}
                            >
                              🍕
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 
                                  className="text-lg font-semibold"
                                  style={{ color: theme.text.primary }}
                                >
                                  Margherita Pizza
                                </h4>
                                <p 
                                  className="text-sm mt-1"
                                  style={{ color: theme.text.secondary }}
                                >
                                  Fresh tomatoes, mozzarella, basil, and our special sauce
                                </p>
                              </div>
                              <span 
                                className="text-lg font-bold"
                                style={{ color: theme.price }}
                              >
                                ₹299
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Featured Menu Item */}
                      <div 
                        className="rounded-2xl p-6"
                        style={{ background: theme.accent }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 
                              className="text-lg font-semibold"
                              style={{ color: theme.text.accent }}
                            >
                              Chef's Special Pasta
                            </h4>
                            <p 
                              className="text-sm mt-1"
                              style={{ color: theme.text.accent }}
                            >
                              Handmade pasta with truffle sauce and parmesan
                            </p>
                          </div>
                          <span 
                            className="text-lg font-bold"
                            style={{ color: theme.text.accent }}
                          >
                            ₹399
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ThemeBuilder; 