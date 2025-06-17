import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/Footer';
import { Star, Users, Zap, QrCode, Smartphone, Clock, Info, Mail } from 'lucide-react';

const Home = () => {
  const { isAuthenticated, isAdmin, isOwner } = useAuth();

  // Redirect owners to dashboard
  if (isOwner) {
    return <Navigate to="/dashboard" replace />;
  }

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Restaurant Owner",
      content: "Menuor has transformed how we manage our menu. Our customers love the QR code feature!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Café Manager",
      content: "The ease of updating our menu in real-time has saved us countless hours and printing costs.",
      rating: 5
    },
    {
      name: "Lisa Martinez",
      role: "Restaurant Manager",
      content: "The customer support is exceptional, and the platform is so intuitive to use.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 lg:py-32 bg-primary text-primary-foreground overflow-hidden before:absolute before:inset-0 before:bg-[linear-gradient(45deg,rgba(0,0,0,0.2),transparent_40%)]">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 animate-[pulse_4s_ease-in-out_infinite]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="space-y-4 animate-[fadeIn_1s_ease-out]">
            <h1 className="text-4xl md:text-6xl font-bold font-display mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-primary-foreground via-primary-foreground/90 to-primary-foreground drop-shadow-lg">
              Create Beautiful Digital Menus for Your Restaurant
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto opacity-90 leading-relaxed">
              A simple and elegant way to manage and showcase your restaurant's menu with QR codes. Get started in minutes!
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {!isAuthenticated && (
                <>
                  <Link to="/register">
                    <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg px-8 py-6 text-lg relative overflow-hidden transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700">
                      Get Started
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" className="bg-primary-foreground border-primary-foreground text-primary hover:bg-primary-foreground/10 hover:text-primary-foreground px-8 py-6 text-lg backdrop-blur-sm transition-all duration-300 hover:scale-105">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
              {isAdmin && (
                <Link to="/admin">
                  <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg px-8 py-6 text-lg relative overflow-hidden transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700">
                    Go to Admin Panel
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-card opacity-40"></div>
      </section>

      {/* Quick Access Section for Logged In Users */}
      {isAuthenticated && !isOwner && (
        <section className="relative py-12 px-4 sm:px-6 lg:px-8 bg-card">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold font-display text-center mb-8 text-card-foreground">
              Quick Access
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Link to="/about">
                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <Info className="h-12 w-12 mb-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="text-2xl font-bold mb-2">About Us</h3>
                    <p className="text-muted-foreground">Learn more about our mission and the team behind Menuor</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/contact">
                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <Mail className="h-12 w-12 mb-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="text-2xl font-bold mb-2">Contact Us</h3>
                    <p className="text-muted-foreground">Get in touch with our team for support or inquiries</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-card overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(0,0,0,0.025),transparent_50%)]"></div>
        <div className="max-w-7xl mx-auto relative">
          <h2 className="text-4xl font-bold font-display text-center mb-16 text-card-foreground bg-clip-text relative">
            <span className="relative inline-block">
              Everything You Need for Your Restaurant Menu
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-accent rounded-full"></div>
            </span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="restaurant-card border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-background/80 backdrop-blur-sm group">
              <CardContent className="p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform duration-500"></div>
                <QrCode className="h-12 w-12 mb-6 text-accent transform group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl font-bold mb-4 text-card-foreground">QR Code Menus</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Generate unique QR codes for easy menu access on any device.
                </p>
              </CardContent>
            </Card>
            
            <Card className="restaurant-card border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-background/80 backdrop-blur-sm group">
              <CardContent className="p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform duration-500"></div>
                <Smartphone className="h-12 w-12 mb-6 text-accent transform group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl font-bold mb-4 text-card-foreground">Mobile Friendly</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Your customers can easily view your menu on any device.
                </p>
              </CardContent>
            </Card>
            
            <Card className="restaurant-card border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-background/80 backdrop-blur-sm group">
              <CardContent className="p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform duration-500"></div>
                <Clock className="h-12 w-12 mb-6 text-accent transform group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl font-bold mb-4 text-card-foreground">Real-time Updates</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Update your menu instantly without reprinting physical menus.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold font-display text-center mb-16 text-foreground relative">
            <span className="relative inline-block">
              What Our Customers Say
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-accent rounded-full"></div>
            </span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card border-border">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-card-foreground mb-6">{testimonial.content}</p>
                  <div>
                    <p className="font-semibold text-card-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-lg text-primary-foreground/80">Restaurants</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5000+</div>
              <div className="text-lg text-primary-foreground/80">Menu Views</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99%</div>
              <div className="text-lg text-primary-foreground/80">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-background border-t border-border overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,0,0,0.02),transparent_70%)]"></div>
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-4xl font-bold font-display mb-6 text-foreground">
            <span className="relative inline-block">
              Ready to Digitize Your Menu?
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-accent rounded-full"></div>
            </span>
          </h2>
          <p className="text-xl mb-10 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Join thousands of restaurants that have already simplified their menu management with Menuor.
          </p>
          {!isAuthenticated && (
            <Link to="/register">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-white shadow-lg px-8 py-6 text-lg relative overflow-hidden transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700">
                Create Your Menu Now
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
