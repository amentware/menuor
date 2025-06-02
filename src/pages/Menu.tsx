import React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { db, doc, getDoc } from '@/lib/firebase';
import { Restaurant, MenuSection } from '@/types';
import { useQRTracking } from '@/hooks/useQRTracking';
import { Clock, MapPin, Phone, Globe, Star, ChevronDown, ChevronUp, Menu as MenuIcon, Search, Filter, Heart, Share2 } from 'lucide-react';

const Menu = () => {
  const { restaurantId } = useParams();
  const [searchParams] = useSearchParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSections, setOpenSections] = useState(new Set());
  const [showCategoryNav, setShowCategoryNav] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [favoriteItems, setFavoriteItems] = useState(new Set());
  const { trackQRScan } = useQRTracking();
  const [menuFullyLoaded, setMenuFullyLoaded] = useState(false);

  // Check if this is a preview view
  const isPreview = searchParams.get('preview') === 'true' || 
    document.referrer.includes('/dashboard') || 
    document.referrer.includes('/menu-builder') ||
    document.referrer.includes('/qr-code') ||
    window.location.href.includes('localhost') ||
    window.location.href.includes('127.0.0.1');

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

  // Track QR scan only after menu is fully loaded and not in preview mode
  useEffect(() => {
    if (menuFullyLoaded && !isPreview && restaurantId) {
      trackQRScan(restaurantId).catch(error => {
        console.error('Error tracking QR scan:', error);
      });
    }
  }, [menuFullyLoaded, isPreview, restaurantId]);

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

  const toggleFavorite = (itemId) => {
    const newFavorites = new Set(favoriteItems);
    if (newFavorites.has(itemId)) {
      newFavorites.delete(itemId);
    } else {
      newFavorites.add(itemId);
    }
    setFavoriteItems(newFavorites);
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
      <div className="min-h-screen bg-gradient-to-br from-[hsl(50,75%,98%)] to-[hsl(150,13%,94%)] flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-[hsl(150,13%,94%)] backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-[hsl(109,22%,75%)]">
            <div className="w-20 h-20 bg-gradient-to-r from-[hsl(170,94%,27%)] to-[hsl(44,88%,51%)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <MenuIcon className="w-10 h-10 text-[hsl(50,75%,98%)]" />
            </div>
            <h1 className="text-3xl font-bold text-[hsl(0,1%,15%)] mb-4">Menu Unavailable</h1>
            <p className="text-[hsl(0,1%,15%)] text-lg opacity-80">{error || 'The requested menu could not be found.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const currencySymbol = "₹";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(50,75%,98%)] via-[hsl(150,13%,94%)] to-[hsl(50,75%,98%)]">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(170,94%,27%)] via-[hsl(165,47%,43%)] to-[hsl(170,94%,27%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/20" />
        
        {/* Floating Decorations */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-[hsl(44,88%,51%)] bg-opacity-20 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-[hsl(50,75%,98%)] bg-opacity-10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-[hsl(165,47%,43%)] bg-opacity-15 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}} />
        
        <div className="relative py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            {/* Restaurant Name */}
            <div className="mb-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[hsl(50,75%,98%)] mb-4 leading-tight">
                {restaurant.name}
              </h1>
              <div className="w-24 h-1 bg-[hsl(44,88%,51%)] mx-auto rounded-full shadow-lg"></div>
            </div>
            
            {/* Description */}
            {restaurant.description && (
              <p className="text-lg sm:text-xl text-[hsl(50,75%,98%)] opacity-95 mb-8 max-w-3xl mx-auto leading-relaxed font-light">
                {restaurant.description}
              </p>
            )}
            
            {/* Contact Info */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {restaurant.location && (
                <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/30 shadow-lg">
                  <MapPin className="h-5 w-5 text-[hsl(44,88%,51%)]" />
                  <span className="text-[hsl(50,75%,98%)] font-medium">{restaurant.location}</span>
                </div>
              )}
              {restaurant.contact && (
                <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/30 shadow-lg">
                  <Phone className="h-5 w-5 text-[hsl(44,88%,51%)]" />
                  <span className="text-[hsl(50,75%,98%)] font-medium">{restaurant.contact}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 bg-[hsl(44,88%,51%)] text-[hsl(0,1%,15%)] px-6 py-3 rounded-2xl font-semibold hover:bg-[hsl(44,88%,45%)] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Share2 className="w-5 h-5" />
                Share Menu
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="sticky top-0 z-40 bg-[hsl(170,94%,27%)]/95 backdrop-blur-xl border-b border-[hsl(109,22%,75%)] shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[hsl(50,75%,98%)] opacity-70" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[hsl(44,88%,51%)] focus:border-transparent text-[hsl(50,75%,98%)] placeholder-[hsl(50,75%,98%)]/70 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Floating Category Navigation */}
      {activeMenuSections.length > 2 && (
        <div className="fixed bottom-8 right-6 z-50">
          <button
            onClick={() => setShowCategoryNav(!showCategoryNav)}
            className={`w-16 h-16 rounded-2xl shadow-2xl transition-all duration-300 flex items-center justify-center ${
              showCategoryNav 
                ? 'bg-[hsl(44,88%,51%)] text-[hsl(0,1%,15%)] rotate-90 scale-110' 
                : 'bg-[hsl(170,94%,27%)] text-[hsl(50,75%,98%)] hover:bg-[hsl(170,94%,22%)] hover:scale-105'
            }`}
          >
            <MenuIcon className="w-7 h-7" />
          </button>

          {showCategoryNav && (
            <div className="absolute bottom-20 right-0 w-72 max-h-80 bg-[hsl(150,13%,94%)] backdrop-blur-xl rounded-3xl shadow-2xl border border-[hsl(109,22%,75%)] overflow-hidden animate-slide-up">
              <div className="p-6">
                <h3 className="text-lg font-bold text-[hsl(0,1%,15%)] mb-4 text-center">Menu Categories</h3>
                <div className="space-y-2">
                  {activeMenuSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        scrollToSection(section.id);
                        setShowCategoryNav(false);
                      }}
                      className="w-full text-left p-4 rounded-2xl transition-all duration-200 hover:bg-[hsl(170,94%,27%)] hover:text-[hsl(50,75%,98%)] group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-[hsl(0,1%,15%)] group-hover:text-[hsl(50,75%,98%)]">{section.name}</div>
                          <div className="text-sm text-[hsl(0,1%,15%)]/60 group-hover:text-[hsl(50,75%,98%)]/80">
                            {section.items?.filter(item => !item.isDisabled).length || 0} dishes
                          </div>
                        </div>
                        <div className="w-3 h-3 rounded-full bg-[hsl(44,88%,51%)]"></div>
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
            <div className="bg-[hsl(150,13%,94%)] backdrop-blur-lg rounded-3xl shadow-2xl p-12 max-w-lg mx-auto border border-[hsl(109,22%,75%)]">
              <div className="w-24 h-24 bg-gradient-to-r from-[hsl(170,94%,27%)] to-[hsl(44,88%,51%)] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                <MenuIcon className="w-12 h-12 text-[hsl(50,75%,98%)]" />
              </div>
              <h2 className="text-3xl font-bold text-[hsl(170,94%,27%)] mb-6">
                {searchTerm ? 'No dishes found' : 'Menu Coming Soon'}
              </h2>
              <p className="text-[hsl(0,1%,15%)] text-lg opacity-80 leading-relaxed">
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
                  className="bg-[hsl(150,13%,94%)] backdrop-blur-lg rounded-3xl shadow-xl border border-[hsl(109,22%,75%)] overflow-hidden"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={`w-full p-8 flex items-center justify-between transition-all duration-300 ${
                      isOpen 
                        ? 'bg-gradient-to-r from-[hsl(170,94%,27%)] to-[hsl(165,47%,43%)]' 
                        : 'bg-gradient-to-r from-[hsl(150,13%,94%)] to-[hsl(109,22%,75%)] hover:from-[hsl(170,94%,27%)] hover:to-[hsl(165,47%,43%)]'
                    } group`}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-4 h-4 rounded-full ${
                        isOpen ? 'bg-[hsl(44,88%,51%)]' : 'bg-[hsl(170,94%,27%)] group-hover:bg-[hsl(44,88%,51%)]'
                      } shadow-lg`} />
                      <h2 className={`text-2xl md:text-3xl font-bold ${
                        isOpen ? 'text-[hsl(50,75%,98%)]' : 'text-[hsl(170,94%,27%)] group-hover:text-[hsl(50,75%,98%)]'
                      }`}>
                        {section.name}
                      </h2>
                      <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                        isOpen 
                          ? 'bg-[hsl(44,88%,51%)] text-[hsl(0,1%,15%)]' 
                          : 'bg-[hsl(170,94%,27%)] text-[hsl(50,75%,98%)] group-hover:bg-[hsl(44,88%,51%)] group-hover:text-[hsl(0,1%,15%)]'
                      } shadow-lg`}>
                        {activeItems.length} dishes
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className={`text-sm font-medium hidden sm:block ${
                        isOpen ? 'text-[hsl(50,75%,98%)]' : 'text-[hsl(170,94%,27%)] group-hover:text-[hsl(50,75%,98%)]'
                      }`}>
                        {isOpen ? 'Collapse' : 'Expand'}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-6 h-6 text-[hsl(50,75%,98%)]" />
                      ) : (
                        <ChevronDown className={`w-6 h-6 ${
                          isOpen ? 'text-[hsl(50,75%,98%)]' : 'text-[hsl(170,94%,27%)] group-hover:text-[hsl(50,75%,98%)]'
                        }`} />
                      )}
                    </div>
                  </button>
                  
                  {/* Section Content */}
                  <div className={`transition-all duration-500 ease-in-out ${
                    isOpen ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
                  } overflow-hidden`}>
                    <div className="p-8 space-y-6">
                      {activeItems.map((item, itemIndex) => (
                        <div 
                          key={item.id} 
                          className="group bg-[hsl(50,75%,98%)] rounded-2xl p-6 border border-[hsl(109,22%,75%)] hover:shadow-xl hover:border-[hsl(44,88%,51%)] transition-all duration-300 hover:scale-[1.02]"
                          style={{
                            animationDelay: isOpen ? `${itemIndex * 100}ms` : '0ms'
                          }}
                        >
                          <div className="flex gap-6">
                            {/* Item Image */}
                            {item.imageUrl && (
                              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg ring-2 ring-[hsl(44,88%,51%)] ring-opacity-50">
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
                              <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <h3 className="text-xl font-bold text-[hsl(170,94%,27%)] group-hover:text-[hsl(44,88%,51%)] transition-colors">
                                      {item.name}
                                    </h3>
                                    {item.outOfStock && (
                                      <span className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-semibold">
                                        Out of Stock
                                      </span>
                                    )}
                                    <button
                                      onClick={() => toggleFavorite(item.id)}
                                      className={`p-2 rounded-full transition-all duration-200 ${
                                        favoriteItems.has(item.id)
                                          ? 'bg-[hsl(44,88%,51%)]/20 text-[hsl(44,88%,51%)]'
                                          : 'bg-[hsl(170,94%,27%)]/10 text-[hsl(170,94%,27%)] hover:bg-[hsl(44,88%,51%)]/20 hover:text-[hsl(44,88%,51%)]'
                                      }`}
                                    >
                                      <Heart className={`w-4 h-4 ${favoriteItems.has(item.id) ? 'fill-current' : ''}`} />
                                    </button>
                                  </div>
                                  
                                  {item.description && (
                                    <p className="text-[hsl(170,94%,27%)]/70 leading-relaxed mb-4">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                                
                                {/* Pricing */}
                                <div className="text-right flex-shrink-0">
                                  {item.priceVariations && item.priceVariations.length > 0 ? (
                                    <div className="space-y-2">
                                      {item.priceVariations.map((variation, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                          <span className="text-sm text-[hsl(170,94%,27%)] bg-[hsl(170,94%,27%)]/10 px-3 py-1 rounded-full">
                                            {variation.name}
                                          </span>
                                          <span className="font-bold text-xl text-[hsl(44,88%,51%)]">
                                            {currencySymbol}{variation.price.toFixed(2)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    item.price && item.price > 0 && (
                                      <span className="font-bold text-2xl text-[hsl(44,88%,51%)]">
                                        {currencySymbol}{item.price.toFixed(2)}
                                      </span>
                                    )
                                  )}
                                </div>
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
      <div className="bg-gradient-to-r from-[hsl(170,94%,27%)] to-[hsl(165,47%,43%)] border-t border-[hsl(109,22%,75%]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-md rounded-2xl px-6 py-4 shadow-lg border border-white/30">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-[hsl(44,88%,51%)] rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-[hsl(50,75%,98%)] rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <div className="w-2 h-2 bg-[hsl(44,88%,51%)] rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
            <span className="text-lg font-semibold text-[hsl(50,75%,98%)]">
              Crafted with MenuBuilder
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
            animation: slide-up 0.4s ease-out;
          }
        `}
      </style>
    </div>
  );
};

export default Menu;