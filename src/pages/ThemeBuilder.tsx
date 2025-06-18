import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db, doc, updateDoc, getDoc } from '@/lib/firebase';
import { Restaurant, MenuTheme } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const defaultTheme: MenuTheme = {
  // Primary teal color
  primary: 'hsl(170, 94%, 27%)', // --primary: 170 94% 27%

  // Secondary teal color
  secondary: 'hsl(165, 47%, 43%)', // --secondary: 165 47% 43%
  
  // Accent yellow/gold color
  accent: 'hsl(44, 88%, 51%)', // --accent: 44 88% 51%
  
  // Background cream color
  background: 'hsl(50, 75%, 98%)', // --background: 50 75% 98%
  
  // Card background (slightly different from main background)
  card: 'hsl(150, 13%, 94%)', // --card: 150 13% 94%
  
  // Border color (muted)
  border: 'hsl(109, 22%, 75%)', // --border: 109 22% 75%
  
  text: {
    // Primary text color (dark)
    primary: 'hsl(0, 1%, 15%)', // --foreground: 0 1% 15%
    
    // Secondary text color (muted version of primary)
    secondary: 'hsl(0, 1%, 45%)', // Slightly lighter than primary for secondary text
    
    // Accent text color (light for contrast on dark backgrounds)
    accent: 'hsl(50, 75%, 98%)' // --primary-foreground: 50 75% 98%
  },

  // Price color using the accent color for emphasis
  price: 'hsl(44, 88%, 51%)' // --accent: 44 88% 51% (same as accent for consistency)
};

const ThemeBuilder = () => {
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [theme, setTheme] = useState<MenuTheme>(defaultTheme);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const [previewScale, setPreviewScale] = useState(0.4);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!restaurantId) return;
      
      try {
        const restaurantDoc = await getDoc(doc(db, 'restaurants', restaurantId));
        if (restaurantDoc.exists()) {
          const data = restaurantDoc.data() as Restaurant;
          setRestaurant(data);
          setTheme(data.theme || defaultTheme);
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
  }, [restaurantId]);

  const handleSave = async () => {
    if (!restaurantId) return;
    
    setSaving(true);
    try {
      await updateDoc(doc(db, 'restaurants', restaurantId), {
        theme
      });
      
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-lg">Loading theme builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Theme Builder</h1>
          <p className="text-gray-600 mt-2">Customize your menu's appearance</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
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

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Preview Scale</h2>
            <Input
              type="range"
              min="0.2"
              max="0.6"
              step="0.1"
              value={previewScale}
              onChange={(e) => setPreviewScale(parseFloat(e.target.value))}
              className="w-full"
            />
          </Card>
        </div>

        {/* Preview */}
        <div className="sticky top-8">
          <Card className="p-4 overflow-hidden">
            <h2 className="text-2xl font-semibold mb-4">Live Preview</h2>
            <div className="border rounded-lg overflow-hidden" style={{ height: '800px' }}>
              <div style={{ transform: `scale(${previewScale})`, transformOrigin: 'top left', width: `${100/previewScale}%`, height: `${100/previewScale}%` }}>
                <iframe
                  src={`/menu/${restaurantId}?preview=true`}
                  className="w-full h-full"
                  style={{
                    pointerEvents: 'none'
                  }}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ThemeBuilder; 