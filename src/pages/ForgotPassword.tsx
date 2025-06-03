import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { auth, sendPasswordResetEmail } from '../lib/firebase';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

type FormData = z.infer<typeof formSchema>;

const ForgotPassword = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    setIsLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, data.email);
      setEmailSent(true);
      toast({
        title: "Reset email sent!",
        description: "Check your inbox for password reset instructions.",
      });
    } catch (err: any) {
      setIsLoading(false);
      let errorMessage = "Failed to send reset email. Please try again.";
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email address";
      }
      
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-3xl font-display text-center text-primary">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Enter your email to receive password reset instructions
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {emailSent ? (
            <div className="text-center space-y-4">
              <Alert className="mb-4">
                <AlertDescription>
                  Check your email for password reset instructions. The link will expire in 1 hour.
                </AlertDescription>
              </Alert>
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors duration-200"
                onClick={() => navigate('/login')}
              >
                Return to Login
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="email@example.com" 
                          {...field} 
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Sending Reset Email...
                    </>
                  ) : (
                    "Send Reset Email"
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        
        {!emailSent && (
          <CardFooter className="flex flex-col space-y-2">
            <p className="text-center text-sm">
              Remember your password?{" "}
              <Link to="/login" className="text-primary font-medium hover:text-secondary">
                Login
              </Link>
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword; 