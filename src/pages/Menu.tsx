import React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { db, doc, getDoc } from '@/lib/firebase';
import { Restaurant, MenuSection } from '@/types';
import { useQRTracking } from '@/hooks/useQRTracking';
import { Clock, MapPin, Phone, Globe, Star, ChevronDown, ChevronUp, Menu as MenuIcon, Search, Filter, Share2 } from 'lucide-react';

// Update CSSProperties type to include our custom properties
type CSSProperties = React.CSSProperties & {
  '--tw-ring-color'?: string;
  '--tw-ring-opacity'?: string;
  '--tw-hover-bg-opacity'?: string;
  color?: string;
  background?: string;
  borderColor?: string;
};

const Menu = () => {
  const { restaurantId } = useParams();
  const [searchParams] = useSearchParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSections, setOpenSections] = useState(new Set());
  const [showCategoryNav, setShowCategoryNav] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { trackQRScan } = useQRTracking();
  const [menuFullyLoaded, setMenuFullyLoaded] = useState(false);

  // Check if this is a preview view - only check preview parameter
  const isPreview = React.useMemo(() => {
    const isPreview = searchParams.get('preview') === 'true';
    console.log('Preview check:', isPreview);
    return isPreview;
  }, [searchParams]);

  // Track QR scan only after menu is fully loaded and not in preview mode
  useEffect(() => {
    if (menuFullyLoaded && !isPreview && restaurantId) {
      console.log('Tracking QR scan');
      trackQRScan(restaurantId)
        .catch(error => {
          console.error('Error tracking QR scan:', error);
        });
    }
  }, [menuFullyLoaded, isPreview, restaurantId, trackQRScan]);

  // Set menu as fully loaded when restaurant data is available
  useEffect(() => {
    if (restaurant && !menuFullyLoaded) {
      console.log('📱 Menu content loaded, setting menuFullyLoaded flag');
      // Small delay to ensure all content is rendered
      const timer = setTimeout(() => {
        setMenuFullyLoaded(true);
        console.log('✅ Menu fully loaded flag set to true');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [restaurant, menuFullyLoaded]);

  // Memoize the fetch function to prevent recreating it on every render
  const fetchRestaurant = useCallback(async () => {
    if (!restaurantId) {
      setError('Restaurant ID not provided');
      setLoading(false);
      return;
    }

    try {
      const restaurantDoc = await getDoc(doc(db, 'restaurants', restaurantId));
      
      if (restaurantDoc.exists()) {
        const data = restaurantDoc.data();
        const restaurantData: Restaurant = { id: restaurantDoc.id, ...data } as Restaurant;
        
        if (!restaurantData.isPublic) {
          setError('This menu is private and not available for public viewing');
          setLoading(false);
          return;
        }
        
        setRestaurant(restaurantData);
        setLoading(false);
        
        // Set menu as fully loaded after a short delay to ensure all content is rendered
        setTimeout(() => {
          setMenuFullyLoaded(true);
        }, 1000);
      } else {
        setError('Restaurant not found');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      setError('Failed to load menu');
      setLoading(false);
    }
  }, [restaurantId]);

  // Use effect with only fetchRestaurant as dependency
  useEffect(() => {
    fetchRestaurant();
  }, [fetchRestaurant]);

  const toggleSection = (sectionId) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionId)) {
      newOpenSections.delete(sectionId);
    } else {
      newOpenSections.add(sectionId);
    }
    setOpenSections(newOpenSections);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setOpenSections(prev => new Set([...prev, sectionId]));
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: restaurant.name,
        text: restaurant.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  const menuSections = restaurant?.menuSections || [];
  const activeMenuSections = menuSections.filter(section => !section.isDisabled);

  // Filter items based on search
  const filteredSections = activeMenuSections.map(section => ({
    ...section,
    items: section.items.filter(item => 
      !item.isDisabled && 
      (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })).filter(section => section.items.length > 0);
// Get theme from restaurant data or use default theme
const theme = restaurant?.theme || {
  primary: '#0da98a',       // hsl(170, 94%, 27%) equivalent
  secondary: '#0da98a',     // hsl(170, 94%, 27%) equivalent
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

// Create CSS variables for theme colors
useEffect(() => {
  if (theme) {
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, value]) => {
      if (typeof value === 'object') {
        // Handle nested objects like text colors
        Object.entries(value as Record<string, string>).forEach(([subKey, subValue]) => {
          root.style.setProperty(`--menu-${key}-${subKey}`, subValue);
        });
      } else {
        root.style.setProperty(`--menu-${key}`, value as string);
      }
    });
  }
}, [theme]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(50,75%,98%)] to-[hsl(150,13%,94%)] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-[hsl(109,22%,75%)] border-t-[hsl(170,94%,27%)] mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-transparent border-t-[hsl(44,88%,51%)] mx-auto animate-ping"></div>
          </div>
          <p className="mt-8 text-[hsl(0,1%,15%)] font-semibold text-lg">Preparing your culinary journey...</p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-[hsl(170,94%,27%)] rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-[hsl(165,47%,43%)] rounded-full animate-bounce" style={{animationDelay: '100ms'}}></div>
            <div className="w-2 h-2 bg-[hsl(44,88%,51%)] rounded-full animate-bounce" style={{animationDelay: '200ms'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--menu-background)' }}>
        <div className="text-center max-w-md mx-auto">
          <div className="backdrop-blur-lg rounded-3xl shadow-2xl p-10" style={{ 
            background: 'var(--menu-card)', 
            borderColor: 'var(--menu-border)' 
          }}>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg" 
              style={{ background: `linear-gradient(to right, var(--menu-primary), var(--menu-accent))` }}
            >
              <MenuIcon className="w-10 h-10" style={{ color: 'var(--menu-text-accent)' }} />
            </div>
            <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--menu-text-primary)' }}>Menu Unavailable</h1>
            <p className="opacity-80" style={{ color: 'var(--menu-text-secondary)' }}>{error || 'The requested menu could not be found.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const currencySymbol = "₹";

  return (
    <div className="min-h-screen" style={{ background: 'var(--menu-background)' }}>
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0" style={{ 
          background: `linear-gradient(to right, var(--menu-primary), var(--menu-secondary), var(--menu-primary))` 
        }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/20" />
        
        {/* Floating Decorations */}
      
        <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full blur-xl animate-pulse" 
          style={{ background: 'var(--menu-secondary)', opacity: 0.15, animationDelay: '6s' }} />
        
        {/* Content */}
        <div className="relative py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            {/* Restaurant Name */}
            <div className="mb-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight" 
                style={{ color: 'var(--menu-text-accent)' }}>
                {restaurant.name}
              </h1>
              <div className="w-24 h-1 mx-auto rounded-full shadow-lg" 
                style={{ background: 'var(--menu-accent)' }}></div>
            </div>
            
            {/* Description */}
            {restaurant.description && (
              <p className="text-lg sm:text-xl opacity-95 mb-8 max-w-3xl mx-auto leading-relaxed font-light" style={{ color: 'var(--menu-text-accent)' }}>
                {restaurant.description}
              </p>
            )}
            
            {/* Contact Info */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {restaurant.location && (
                <div className="flex items-center gap-3 backdrop-blur-md rounded-2xl px-6 py-3 shadow-lg" 
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.2)', 
                    border: '1px solid rgba(255, 255, 255, 0.3)' 
                  }}
                >
                  <MapPin className="h-5 w-5" style={{ color: 'var(--menu-accent)' }} />
                  <span style={{ color: 'var(--menu-text-accent)' }}>{restaurant.location}</span>
                </div>
              )}
              {restaurant.contact && (
                <div className="flex items-center gap-3 backdrop-blur-md rounded-2xl px-6 py-3 shadow-lg" 
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.2)', 
                    border: '1px solid rgba(255, 255, 255, 0.3)' 
                  }}
                >
                  <Phone className="h-5 w-5" style={{ color: 'var(--menu-accent)' }} />
                  <span style={{ color: 'var(--menu-text-accent)' }}>{restaurant.contact}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                style={{ 
                  background: 'var(--menu-accent)',
                  color: 'var(--menu-text-primary)'
                }}
              >
                <Share2 className="w-5 h-5" />
                Share Menu
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="sticky top-0 z-40 backdrop-blur-xl border-b" 
        style={{ 
          background: 'var(--menu-primary)F5', 
          borderColor: 'var(--menu-border)' 
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" 
              style={{ color: 'var(--menu-text-accent)', opacity: 0.7 }} 
            />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2"
              style={{ 
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'var(--menu-text-accent)',
                '--tw-ring-color': 'var(--menu-accent)'
              } as CSSProperties}
            />
          </div>
        </div>
      </div>

      {/* Floating Category Navigation */}
      {activeMenuSections.length > 2 && (
        <div className="fixed bottom-8 right-6 z-50">
          <button
            onClick={() => setShowCategoryNav(!showCategoryNav)}
            className="w-16 h-16 rounded-2xl shadow-2xl transition-all duration-300 flex items-center justify-center"
            style={{
              background: showCategoryNav ? 'var(--menu-accent)' : 'var(--menu-primary)',
              color: showCategoryNav ? 'var(--menu-text-primary)' : 'var(--menu-text-accent)',
              transform: showCategoryNav ? 'rotate(90deg) scale(1.1)' : 'scale(1)'
            }}
          >
            <MenuIcon className="w-7 h-7" />
          </button>

          {showCategoryNav && (
            <div className="absolute bottom-20 right-0 w-72 max-h-80 backdrop-blur-xl rounded-3xl shadow-2xl border overflow-hidden animate-slide-up"
              style={{
                background: 'var(--menu-card)',
                borderColor: 'var(--menu-border)'
              }}
            >
              <div className="p-6">
                <h3 className="text-lg font-bold mb-4 text-center" style={{ color: 'var(--menu-text-primary)' }}>Menu Categories</h3>
                <div className="space-y-2">
                  {activeMenuSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        scrollToSection(section.id);
                        setShowCategoryNav(false);
                      }}
                      className="w-full text-left p-4 rounded-2xl transition-all duration-200 group hover:shadow-md"
                      style={{
                        background: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--menu-primary)';
                        e.currentTarget.style.color = 'var(--menu-text-accent)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--menu-text-primary)';
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold" style={{ color: 'inherit' }}>{section.name}</div>
                          <div className="text-sm opacity-60" style={{ color: 'inherit' }}>
                            {section.items?.filter(item => !item.isDisabled).length || 0} dishes
                          </div>
                        </div>
                        <div className="w-3 h-3 rounded-full" style={{ background: 'var(--menu-accent)' }}></div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Menu Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredSections.length === 0 ? (
          <div className="text-center py-12">
            <div className="backdrop-blur-lg rounded-3xl shadow-2xl p-12 max-w-lg mx-auto" 
              style={{ 
                background: 'var(--menu-card)',
                border: `1px solid var(--menu-border)`
              }}
            >
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg" 
                style={{ 
                  background: `linear-gradient(to right, var(--menu-primary), var(--menu-accent))`
                }}
              >
                <MenuIcon className="w-12 h-12" style={{ color: 'var(--menu-text-accent)' }} />
              </div>
              <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--menu-text-primary)' }}>
                {searchTerm ? 'No dishes found' : 'Menu Coming Soon'}
              </h2>
              <p className="text-lg opacity-80 leading-relaxed" style={{ color: 'var(--menu-text-secondary)' }}>
                {searchTerm 
                  ? `No dishes match "${searchTerm}". Try a different search term.`
                  : "We're crafting something extraordinary. Please check back soon!"
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredSections.map((section, index) => {
              const activeItems = section.items.filter(item => !item.isDisabled);
              const isOpen = openSections.has(section.id);
              
              if (activeItems.length === 0) return null;
              
              return (
                <div 
                  key={section.id} 
                  id={`section-${section.id}`}
                  className="backdrop-blur-lg rounded-3xl shadow-xl border overflow-hidden"
                  style={{
                    background: 'var(--menu-card)',
                    borderColor: 'var(--menu-border)',
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full p-8 flex items-center justify-between transition-all duration-300 group"
                    style={{ 
                      background: isOpen 
                        ? `linear-gradient(to right, var(--menu-primary), var(--menu-secondary))` 
                        : 'var(--menu-card)'
                    }}
                  >
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold" 
                        style={{ color: isOpen ? 'var(--menu-text-accent)' : 'var(--menu-text-primary)' }}
                      >
                        {section.name}
                      </h2>
                      <div 
                        className="mt-2 inline-block px-4 py-1 rounded-lg text-sm font-semibold" 
                        style={{ 
                          background: isOpen ? 'var(--menu-accent)' : 'var(--menu-primary)',
                          color: 'var(--menu-text-accent)'
                        }}
                      >
                        {activeItems.length} dishes
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {isOpen ? (
                        <ChevronUp className="w-6 h-6" style={{ color: 'var(--menu-text-accent)' }} />
                      ) : (
                        <ChevronDown className="w-6 h-6" style={{ color: 'var(--menu-text-primary)' }} />
                      )}
                    </div>
                  </button>
                  
                  {/* Section Content */}
                  <div className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'opacity-100' : 'opacity-0'
                  }`}
                    style={{
                      maxHeight: isOpen ? 'none' : '0',
                      overflow: 'hidden'
                    }}
                  >
                    <div className="p-4 space-y-6">
                      {activeItems.map((item, itemIndex) => (
                        <div 
                          key={item.id} 
                          className="group rounded-2xl p-6 border hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                          style={{
                            background: 'var(--menu-background)',
                            borderColor: 'var(--menu-border)',
                            animationDelay: isOpen ? `${itemIndex * 50}ms` : '0ms'
                          }}
                        >
                          <div className="flex gap-6">
                            {/* Item Image */}
                            {item.imageUrl && (
                              <div 
                                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg ring-2" 
                                style={{ 
                                  '--tw-ring-color': 'var(--menu-accent)', 
                                  '--tw-ring-opacity': '0.5'
                                } as CSSProperties}
                              >
                                <img 
                                  src={item.imageUrl} 
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            
                            {/* Item Details */}
                            <div className="flex-1 min-w-0">
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <h3 className="text-xl font-bold" style={{ color: 'var(--menu-text-primary)' }}>
                                    {item.name}
                                  </h3>
                                  {item.outOfStock && (
                                    <span className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-semibold">
                                      Out of Stock
                                    </span>
                                  )}
                                </div>

                                {item.description && (
                                  <p className="leading-relaxed" style={{ color: 'var(--menu-text-secondary)' }}>
                                    {item.description}
                                  </p>
                                )}

                                {/* Pricing */}
                                {item.priceVariations && item.priceVariations.length > 0 ? (
                                  <div className="flex flex-wrap items-center gap-3">
                                    {item.priceVariations.map((variation, index) => (
                                      <div key={index} className="flex items-center gap-2">
                                        <span className="text-sm px-3 py-1 rounded-full" 
                                          style={{ 
                                            background: 'rgba(var(--menu-primary-rgb), 0.1)',
                                            color: 'var(--menu-text-primary)'
                                          }}
                                        >
                                          {variation.name}
                                        </span>
                                        <span className="font-bold text-xl" style={{ color: 'var(--menu-price)' }}>
                                          {currencySymbol}{variation.price.toFixed(2)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  item.price && item.price > 0 && (
                                    <div className="font-bold text-xl" style={{ color: 'var(--menu-price)' }}>
                                      {currencySymbol}{item.price.toFixed(2)}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t" 
        style={{ 
          background: `linear-gradient(to right, var(--menu-primary), var(--menu-secondary))`,
          borderColor: 'var(--menu-border)'
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="inline-flex items-center gap-3 backdrop-blur-md rounded-2xl px-6 py-4 shadow-lg border" 
            style={{ 
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--menu-accent)' }}></div>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--menu-text-accent)', animationDelay: '0.5s' }}></div>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--menu-accent)', animationDelay: '1s' }}></div>
            </div>
            <span className="text-lg font-semibold" style={{ color: 'var(--menu-text-accent)' }}>
              Crafted with Menuor
            </span>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes slide-up {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-slide-up {
            animation: slide-up 0.2s ease-out;
          }
        `}
      </style>
    </div>
  );
};

export default Menu;