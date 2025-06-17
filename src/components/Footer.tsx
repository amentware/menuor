import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import logo from '../assets/navicon.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="Menuor" className="h-8 w-auto" />
            </Link>
            <p className="text-sm text-primary-foreground/80">
              Create beautiful digital menus for your restaurant with QR codes. Simplify menu management and enhance customer experience.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about-us" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact-us" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Get Started
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-primary-foreground/80">
                <Mail className="h-4 w-4" />
                <span>menuor.amentware@gmail.com</span>
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/80">
                <Phone className="h-4 w-4" />
                <span>+91 9207624728</span>
              </li>
              <li className="flex items-start gap-2 text-primary-foreground/80">
                <MapPin className="h-4 w-4 mt-1" />
                <span>4th floor,695<br />
                      14th cross,29th main road<br />
                      Bangalore,560076</span>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Business Hours</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li>Monday - Friday: 9:00 AM - 6:00 PM</li>
              <li>Saturday: 10:00 AM - 4:00 PM</li>
              <li>Sunday: Closed</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/10 py-6 text-center text-sm text-primary-foreground/70">
          <p>© {currentYear} Menuor. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 