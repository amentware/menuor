import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db, doc, getDoc } from "../lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Edit2, MapPin, Crown, RefreshCcw, Store, Info, Mail, Settings as SettingsIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const fetchRestaurantData = async () => {
      if (!currentUser) return;
      
      try {
        const restaurantDoc = await getDoc(doc(db, "restaurants", currentUser.uid));
        
        if (restaurantDoc.exists()) {
          const data = restaurantDoc.data();
          setRestaurant({ id: restaurantDoc.id, ...data });
        } else {
          navigate("/edit-profile");
          toast({
            title: "Profile not found",
            description: "Please complete your restaurant profile.",
          });
        }
      } catch (error) {
        console.error("Error fetching restaurant data:", error);
        setError("Failed to load restaurant data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchRestaurantData();
  }, [currentUser, navigate, toast]);

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <RefreshCcw className="h-8 w-8 animate-spin text-black" />
          <p className="mt-4 text-lg text-black">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <Alert variant="destructive" className="max-w-3xl mx-auto">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Page Heading */}
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold font-display text-black">Settings</h1>
        </div>

        {/* Restaurant Profile Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Restaurant Profile</h2>
          <Card className="bg-white border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 py-6">
              <div className="flex flex-col items-start justify-center">
                <CardTitle className="text-2xl text-primary">
                  {restaurant.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4" />
                  {restaurant.location || "No location set"}
                </CardDescription>
              </div>
              <Button 
                variant="outline"
                className="hover:bg-gray-50 hover:text-black transition-colors duration-200 self-center"
                onClick={() => navigate('/edit-profile', { state: { from: location.pathname } })}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </CardHeader>
          </Card>
        </div>

        {/* Restaurant Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Restaurant Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Restaurant Details Card */}
            <Card className="bg-white border border-gray-200">
              <CardHeader className="pb-0">
                <CardTitle className="text-lg text-primary flex items-center gap-2">
                  <Store className="h-5 w-5 text-accent" />
                  Restaurant Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="font-medium text-sm text-gray-600">Description</p>
                    <p className="text-sm text-primary">
                      {restaurant.description || "No description available."}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-sm text-gray-600">Contact</p>
                    <p className="text-sm text-primary">
                      {restaurant.contact || "No contact information provided."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Plan Details Card */}
            <Card className="bg-white border border-gray-200">
              <CardHeader className="pb-0">
                <CardTitle className="text-lg text-primary flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-500" />
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">Free Menu</h3>
                    <p className="text-sm text-gray-600">Create your digital menu with basic features. Upgrade to remove ads and access premium features.</p>
                  </div>
                  <Button
                    variant="outline"
                    className="hover:bg-white shrink-0 ml-4"
                    onClick={() => navigate('/pricing')}
                  >
                    Upgrade
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Help & Support */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Help & Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-primary flex items-center gap-2">
                  <Info className="h-5 w-5 text-accent" />
                  About Us
                </CardTitle>
                <CardDescription>Learn more about MenuOR and our mission</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline"
                  className="w-full hover:bg-gray-50"
                  onClick={() => navigate('/about-us')}
                >
                  View About Us
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-primary flex items-center gap-2">
                  <Mail className="h-5 w-5 text-accent" />
                  Contact Us
                </CardTitle>
                <CardDescription>Get in touch with our support team</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline"
                  className="w-full hover:bg-gray-50"
                  onClick={() => navigate('/messages')}
                >
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 