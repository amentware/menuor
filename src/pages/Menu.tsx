import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db, doc, getDoc } from '@/lib/firebase';
import { Restaurant, MenuSection } from '@/types';
import { useQRTracking } from '@/hooks/useQRTracking';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, MapPin, Phone, Globe, Star, ChevronDown, ChevronUp, Menu as MenuIcon } from 'lucide-react';

const Menu = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [showCategoryNav, setShowCategoryNav] = useState(false);
  const { trackQRScan } = useQRTracking();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!restaurantId) {
        setError('Restaurant ID not provided');
        setLoading(false);
        return;
      }

      try {
        const restaurantDoc = await getDoc(doc(db, 'restaurants', restaurantId));
        
        if (restaurantDoc.exists()) {
          const data = restaurantDoc.data() as Restaurant;
          const restaurantData = { id: restaurantDoc.id, ...data };
          
          if (!restaurantData.isPublic) {
            setError('This menu is private and not available for public viewing');
            setLoading(false);
            return;
          }
          
          setRestaurant(restaurantData);
       
          
          if (!currentUser || currentUser.uid !== restaurantData.ownerId) {
            await trackQRScan(restaurantId);
          }
        } else {
          setError('Restaurant not found');
        }
      } catch (error) {
        console.error('Error fetching restaurant:', error);
        setError('Failed to load menu');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [restaurantId, trackQRScan, currentUser]);

  const toggleSection = (sectionId: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionId)) {
      newOpenSections.delete(sectionId);
    } else {
      newOpenSections.add(sectionId);
    }
    setOpenSections(newOpenSections);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setOpenSections(prev => new Set([...prev, sectionId]));
    }
    // Explicitly avoid toggling showCategoryNav to ensure manual control
  };

  const menuSections = restaurant?.menuSections || [];
  const activeMenuSections = menuSections.filter((section: MenuSection) => !section.isDisabled);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-indigo-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-purple-400 mx-auto animate-ping"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading your menu...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MenuIcon className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Menu Not Available</h1>
            <p className="text-gray-600">{error || 'The requested menu could not be found.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const currencySymbol = "₹";
  const primaryColor = "#8B2635";
  const secondaryColor = "#F5F5F5";
  const accentColor = "#FFD700";
  const textColor = "#333333";
  const backgroundColor = "#FFFFFF";
  const blackColor = "#000000";

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Modern Header with Glassmorphism */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-r opacity-90"
          style={{ 
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)` 
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-10" />
        
        <div className="absolute top-0 left-0 w-72 h-72 bg-white bg-opacity-5 rounded-full -translate-x-32 -translate-y-32" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white bg-opacity-5 rounded-full translate-x-48 translate-y-48" />
        
        <div className="relative py-8 px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            
            
            <h1 className="text-2xl md:text-4xl font-bold mb-3 leading-tight">
              {restaurant.name}
            </h1>
            
            {restaurant.description && (
              <p className="text-base md:text-lg opacity-95 mb-4 max-w-2xl mx-auto leading-relaxed">
                {restaurant.description}
              </p>
            )}
            
            <div className="flex flex-wrap justify-center gap-3 text-xs">
              {restaurant.location && (
                <div className="flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2">
                  <MapPin className="h-4 w-4" />
                  <span>{restaurant.location}</span>
                </div>
              )}
              {restaurant.contact && (
                <div className="flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Phone className="h-4 w-4" />
                  <span>{restaurant.contact}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation (shown if more than 3 categories) */}
      {activeMenuSections.length > 3 && (
        <div className="sticky top-0 z-40 bg-white bg-opacity-95 backdrop-blur-sm border-b shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Categories</h2>
              <button
                onClick={() => setShowCategoryNav(!showCategoryNav)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showCategoryNav ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <MenuIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{showCategoryNav ? 'Close' : 'Browse'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showCategoryNav ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            {showCategoryNav && (
              <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                {activeMenuSections.map((section: MenuSection) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`text-left p-3 rounded-lg transition-colors ${
                      openSections.has(section.id) ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{section.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {section.items?.filter(item => !item.isDisabled).length || 0} items
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Menu Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 flex-1">
        {activeMenuSections.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <MenuIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4" style={{ color: primaryColor }}>
                Menu Coming Soon
              </h2>
              <p className="text-gray-600">We're crafting something delicious. Please check back later!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {activeMenuSections.map((section: MenuSection, index: number) => {
              const activeItems = section.items.filter(item => !item.isDisabled);
              const isOpen = openSections.has(section.id);
              
              if (activeItems.length === 0) return null;
              
              return (
                <div 
                  key={section.id} 
                  id={`section-${section.id}`}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={`w-full px-6 py-5 flex items-center justify-between transition-colors ${
                      isOpen ? 'bg-indigo-50 text-indigo-700' : 'bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <h2 
                        className="text-2xl font-bold"
                        style={{ color: primaryColor }}
                      >
                        {section.name}
                      </h2>
                      <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">
                        {activeItems.length} items
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium hidden sm:block">
                        {isOpen ? 'Close' : 'Open'} Menu
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-indigo-700" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>
                  
                  <div className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
                  } overflow-hidden bg-white`}>
                    <div className="px-6 pb-6 pt-3 space-y-4">
                      {activeItems.map((item, itemIndex) => (
                        <div 
                          key={item.id} 
                          className="group bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200"
                          style={{
                            animationDelay: isOpen ? `${itemIndex * 50}ms` : '0ms'
                          }}
                        >
                          <div className="flex gap-4">
                            {item.imageUrl && (
                              <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200 ring-2 ring-gray-100">
                                <img 
                                  src={item.imageUrl} 
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-800 transition-colors">
                                      {item.name}
                                    </h3>
                                    {item.outOfStock && (
                                      <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
                                        Out of Stock
                                      </span>
                                    )}
                                  </div>
                                  
                                  {item.description && (
                                    <p className="text-gray-600 mb-3 text-sm leading-relaxed line-clamp-2">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                                
                                <div className="text-right flex-shrink-0">
                                  {item.priceVariations && item.priceVariations.length > 0 ? (
                                    <div className="space-y-1">
                                      {item.priceVariations.map((variation, index) => (
                                        <div key={index} className="flex items-center gap-3 min-w-0">
                                          <span className="text-sm text-gray-600 truncate flex-1">
                                            {variation.name}
                                          </span>
                                          <span 
                                            className="font-bold text-lg whitespace-nowrap"
                                            style={{ color: primaryColor }}
                                          >
                                            {currencySymbol}{variation.price.toFixed(2)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    item.price && item.price > 0 && (
                                      <span 
                                        className="text-2xl font-bold"
                                        style={{ color: primaryColor }}
                                      >
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

      <div className="mt-20 bg-gradient-to-r from-gray-100 to-gray-50 border-t">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm">
            <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-600">
              Powered by MenuBuilder
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;