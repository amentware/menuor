import { Building2, Users, Award, Heart } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="page-container py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">About MenuOR</h1>
        
        <div className="space-y-12">
          {/* Our Story Section */}
          <section className="bg-white rounded-lg p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <Building2 className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-semibold">Our Story</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Founded in 2024, MenuOR emerged from a simple yet powerful idea: to revolutionize how restaurants connect with their customers. 
              We noticed that traditional paper menus were becoming outdated in our digital world, and restaurants needed a modern solution 
              to showcase their offerings.
            </p>
          </section>

          {/* Our Mission Section */}
          <section className="bg-white rounded-lg p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <Award className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-semibold">Our Mission</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Our mission is to empower restaurants with digital tools that enhance customer experience while simplifying menu management. 
              We believe in creating seamless connections between restaurants and their patrons through innovative technology solutions.
            </p>
          </section>

          {/* Our Team Section */}
          <section className="bg-white rounded-lg p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <Users className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-semibold">Our Team</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              We are a diverse team of passionate individuals dedicated to transforming the restaurant industry. Our team combines expertise 
              in technology, design, and hospitality to create solutions that truly make a difference.
            </p>
          </section>

          {/* Our Values Section */}
          <section className="bg-white rounded-lg p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <Heart className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-semibold">Our Values</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Innovation</h3>
                <p className="text-gray-600">Constantly pushing boundaries to create better solutions for our users.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Customer Focus</h3>
                <p className="text-gray-600">Putting our users' needs at the heart of everything we do.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Quality</h3>
                <p className="text-gray-600">Delivering excellence in every aspect of our service.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Sustainability</h3>
                <p className="text-gray-600">Building a future that's better for everyone.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutUs; 