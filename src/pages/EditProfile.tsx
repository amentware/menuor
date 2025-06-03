import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { db, doc, getDoc, updateDoc } from "../lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, { message: "Restaurant name is required" }),
  location: z.string().optional(),
  contact: z.string().optional(),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const EditProfile = () => {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get the return path from state, default to dashboard
  const returnPath = location.state?.from || "/dashboard";

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: "",
      contact: "",
      description: "",
    },
  });

  useEffect(() => {
    const fetchRestaurantData = async () => {
      if (!currentUser) return;
      
      try {
        const restaurantDoc = await getDoc(doc(db, "restaurants", currentUser.uid));
        
        if (restaurantDoc.exists()) {
          const data = restaurantDoc.data();
          setRestaurant({ id: restaurantDoc.id, ...data });
          
          // Set form defaults
          form.reset({
            name: data.name || "",
            location: data.location || "",
            contact: data.contact || "",
            description: data.description || "",
          });
        } else {
          toast({
            title: "Setting up new profile",
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
  }, [currentUser, form, toast]);

  const onSubmit = async (data: FormData) => {
    setError(null);
    setSaving(true);
    
    if (!currentUser) {
      setError("User not authenticated");
      setSaving(false);
      return;
    }
    
    try {
      await updateDoc(doc(db, "restaurants", currentUser.uid), {
        name: data.name,
        location: data.location || "",
        contact: data.contact || "",
        description: data.description || "",
      });
      
      toast({
        title: "Profile updated",
        description: "Your restaurant profile has been saved successfully.",
      });
      
      navigate(returnPath);
    } catch (error) {
      console.error("Error updating restaurant profile:", error);
      setError("Failed to update profile. Please try again.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <RefreshCcw className="h-8 w-8 animate-spin text-black" />
          <p className="mt-4 text-lg text-black">Loading your restaurant profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Page Heading */}
        <h1 className="text-4xl font-bold font-display text-black">
          {restaurant ? "Edit Restaurant Profile" : "Create Restaurant Profile"}
        </h1>
        
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-6">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Restaurant Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="The Tasty Fork" 
                            {...field} 
                            disabled={saving}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="123 Main St, Anytown, USA" 
                            {...field} 
                            disabled={saving}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Information</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Phone: (123) 456-7890, Email: info@example.com" 
                            {...field} 
                            disabled={saving}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Restaurant Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell customers about your restaurant, cuisine, and specialties..." 
                            {...field} 
                            disabled={saving}
                            rows={5}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate(returnPath)}
                    disabled={saving}
                    className="hover:bg-gray-50 hover:text-black transition-colors duration-200"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors duration-200"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> 
                        Saving...
                      </>
                    ) : (
                      "Save Profile"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProfile;
