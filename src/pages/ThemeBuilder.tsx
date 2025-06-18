import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db, doc, getDoc, updateDoc } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCcw, Palette, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  sectionBackground: string;
  sectionText: string;
  itemBackground: string;
  itemText: string;
  priceText: string;
  headerBackground: string;
  headerText: string;
}

const defaultTheme: ThemeColors = {
  background: "hsl(0,0%,100%)", // White background
  text: "hsl(0,1%,15%)", // Text color from image
  primary: "hsl(170,94%,27%)", // Keep primary color
  secondary: "hsl(44,88%,51%)", // Keep secondary color
  sectionBackground: "hsl(0,0%,100%)", // White background
  sectionText: "hsl(0,1%,15%)", // Same as text color
  itemBackground: "hsl(0,0%,100%)", // White background
  itemText: "hsl(0,1%,15%)", // Same as text color
  priceText: "hsl(170,94%,27%)", // Price color from image
  headerBackground: "hsl(0,0%,100%)", // White background
  headerText: "hsl(0,1%,15%)", // Same as text color
};

const ThemeBuilder = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [themeChanged, setThemeChanged] = useState(false);
  const [theme, setTheme] = useState<ThemeColors>(defaultTheme);
  const [previewExpanded, setPreviewExpanded] = useState(true);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchThemeData();
  }, [currentUser?.uid]);

  const fetchThemeData = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      const restaurantRef = doc(db, 'restaurants', currentUser.uid);
      const restaurantDoc = await getDoc(restaurantRef);

      if (restaurantDoc.exists()) {
        const data = restaurantDoc.data();
        if (data.theme) {
          setTheme(data.theme);
        }
      }
    } catch (error) {
      console.error("Error fetching theme data:", error);
      toast({
        title: "Error loading theme",
        description: "Could not load your theme settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setTheme(prev => ({
      ...prev,
      [key]: value
    }));
    setThemeChanged(true);
  };

  const handleSaveTheme = async () => {
    if (!currentUser) return;

    setSaving(true);
    try {
      const restaurantRef = doc(db, 'restaurants', currentUser.uid);
      await updateDoc(restaurantRef, {
        theme,
        lastUpdated: new Date().toISOString()
      });

      setThemeChanged(false);
      toast({
        title: "Theme saved",
        description: "Your theme settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving theme:", error);
      toast({
        title: "Error saving theme",
        description: "Could not save your theme settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
      <div className="flex flex-col md:flex-row justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              onClick={() => navigate('/menu-builder')}
              className="mr-2 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="w-12 h-12 bg-gradient-to-br from-[hsl(170,94%,27%)] to-[hsl(44,88%,51%)] rounded-2xl flex items-center justify-center">
              <Palette className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold font-display text-black">Theme Builder</h1>
          </div>
          <p className="text-gray-600">
            Customize the appearance of your public menu page.
          </p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          {themeChanged && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="py-3 px-4">
                <p className="text-sm text-amber-700">You have unsaved changes</p>
              </CardContent>
            </Card>
          )}
          <Button
            onClick={() => setTheme(defaultTheme)}
            variant="outline"
            className="border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
          <Button
            onClick={handleSaveTheme}
            disabled={!themeChanged || saving}
            className="bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors duration-200"
          >
            {saving ? (
              <>
                <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Theme
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Live Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Live Preview</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewExpanded(!previewExpanded)}
              >
                {previewExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CardHeader>
            {previewExpanded && (
              <CardContent>
                <div style={{ backgroundColor: theme.background }} className="rounded-lg overflow-hidden">
                  {/* Header Preview */}
                  <div 
                    style={{ 
                      backgroundColor: theme.headerBackground,
                    }} 
                    className="relative overflow-hidden"
                  >
                    {/* Background Effects */}
                    <div className="absolute inset-0 bg-gradient-to-r" style={{
                      backgroundImage: `linear-gradient(to right, ${theme.headerBackground}, ${theme.secondary})`
                    }} />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/20" />
                    
                    <div className="relative py-16 px-6">
                      <div className="max-w-5xl mx-auto text-center">
                        <h2 
                          style={{ color: theme.headerText }}
                          className="text-4xl font-bold mb-4"
                        >
                          Sample Restaurant
                        </h2>
                        <div className="w-24 h-1 mx-auto rounded-full" style={{ backgroundColor: theme.secondary }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Section Preview */}
                  <div 
                    style={{ 
                      backgroundColor: theme.sectionBackground,
                      color: theme.sectionText,
                    }} 
                    className="p-6 rounded-lg mt-4"
                  >
                    <h3 className="text-xl font-semibold mb-4">Popular Items</h3>
                    
                    {/* Item Preview */}
                    <div 
                      style={{ 
                        backgroundColor: theme.itemBackground,
                        color: theme.itemText,
                        borderColor: theme.primary,
                      }} 
                      className="p-6 rounded-lg border-2"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="font-bold text-lg">Classic Burger</h4>
                          <p className="text-sm mt-1 opacity-80">
                            Juicy beef patty with fresh lettuce, tomatoes, and special sauce
                          </p>
                        </div>
                        <span style={{ color: theme.priceText }} className="font-bold text-xl">
                          ₹12.99
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Color Customization */}
        <div className="space-y-6">
          <Tabs defaultValue="brand" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="brand">Brand</TabsTrigger>
              <TabsTrigger value="header">Header</TabsTrigger>
              <TabsTrigger value="sections">Sections</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
            </TabsList>

            <TabsContent value="brand" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Brand Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={theme.primary}
                          onChange={(e) => handleColorChange('primary', e.target.value)}
                          className="w-16 h-10"
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
                      <Label>Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={theme.secondary}
                          onChange={(e) => handleColorChange('secondary', e.target.value)}
                          className="w-16 h-10"
                        />
                        <Input
                          type="text"
                          value={theme.secondary}
                          onChange={(e) => handleColorChange('secondary', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="header" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Header Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={theme.headerBackground}
                          onChange={(e) => handleColorChange('headerBackground', e.target.value)}
                          className="w-16 h-10"
                        />
                        <Input
                          type="text"
                          value={theme.headerBackground}
                          onChange={(e) => handleColorChange('headerBackground', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Text Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={theme.headerText}
                          onChange={(e) => handleColorChange('headerText', e.target.value)}
                          className="w-16 h-10"
                        />
                        <Input
                          type="text"
                          value={theme.headerText}
                          onChange={(e) => handleColorChange('headerText', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sections" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Section Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={theme.sectionBackground}
                          onChange={(e) => handleColorChange('sectionBackground', e.target.value)}
                          className="w-16 h-10"
                        />
                        <Input
                          type="text"
                          value={theme.sectionBackground}
                          onChange={(e) => handleColorChange('sectionBackground', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Text Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={theme.sectionText}
                          onChange={(e) => handleColorChange('sectionText', e.target.value)}
                          className="w-16 h-10"
                        />
                        <Input
                          type="text"
                          value={theme.sectionText}
                          onChange={(e) => handleColorChange('sectionText', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="items" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Item Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={theme.itemBackground}
                          onChange={(e) => handleColorChange('itemBackground', e.target.value)}
                          className="w-16 h-10"
                        />
                        <Input
                          type="text"
                          value={theme.itemBackground}
                          onChange={(e) => handleColorChange('itemBackground', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Text Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={theme.itemText}
                          onChange={(e) => handleColorChange('itemText', e.target.value)}
                          className="w-16 h-10"
                        />
                        <Input
                          type="text"
                          value={theme.itemText}
                          onChange={(e) => handleColorChange('itemText', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Price Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={theme.priceText}
                          onChange={(e) => handleColorChange('priceText', e.target.value)}
                          className="w-16 h-10"
                        />
                        <Input
                          type="text"
                          value={theme.priceText}
                          onChange={(e) => handleColorChange('priceText', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ThemeBuilder; 