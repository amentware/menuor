import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db, doc, getDoc, updateDoc } from "../lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MenuSection, MenuItem, PriceVariation } from "@/types";
import { Plus, Trash2, MoveVertical, Save, Edit, RefreshCcw, AlertCircle, XCircle, MoreVertical, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { 
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useIsMobile } from "@/hooks/use-mobile";
import { SortableMenuSection } from "@/components/menu-builder/SortableMenuSection";

// Component for a draggable menu item
const SortableMenuItem = ({ 
  item, 
  onEdit, 
  onDelete,
  onStatusChange,
  currencySymbol
}: { 
  item: MenuItem; 
  onEdit: (item: MenuItem) => void; 
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: 'active' | 'disabled' | 'outOfStock') => void;
  currencySymbol: string;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: item.id });

  const isMobile = useIsMobile();
  
  const getItemStatus = (): 'active' | 'disabled' | 'outOfStock' => {
    if (item.isDisabled) return 'disabled';
    if (item.outOfStock) return 'outOfStock';
    return 'active';
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`bg-white rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-blue-200 mb-4 p-6 ${item.isDisabled ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="font-bold text-lg truncate flex items-center gap-3 text-gray-900">
              {item.name}
              {item.outOfStock && (
                <span className="text-xs px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">Out of Stock</span>
              )}
              {item.isDisabled && (
                <span className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">Disabled</span>
              )}
            </div>
            <div className="text-primary font-bold ml-2">
              {item.priceVariations && item.priceVariations.length > 0 ? (
                <span className="text-green-600 text-xl">{`${currencySymbol}${item.priceVariations[0].price.toFixed(2)}+`}</span>
              ) : (
                item.price ? <span className="text-green-600 text-xl">{currencySymbol}{item.price.toFixed(2)}</span> : <span className="text-gray-400">-</span>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-600 truncate mt-2 leading-relaxed">{item.description}</div>
        </div>
        
        <div className={`flex items-center ml-4 ${isMobile ? 'flex-col gap-2' : 'gap-3'}`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size="sm" 
                variant="outline"
                className="h-10 px-3 border-gray-200 hover:bg-gray-50 rounded-xl"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl border border-gray-100 shadow-lg">
              <DropdownMenuItem 
                onClick={() => onStatusChange(item.id, 'active')}
                className={`rounded-lg ${getItemStatus() === 'active' ? 'bg-green-50 text-green-700 font-medium' : ''}`}
              >
                Active
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onStatusChange(item.id, 'outOfStock')}
                className={`rounded-lg ${getItemStatus() === 'outOfStock' ? 'bg-orange-50 text-orange-700 font-medium' : ''}`}
              >
                Out of Stock
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onStatusChange(item.id, 'disabled')}
                className={`rounded-lg ${getItemStatus() === 'disabled' ? 'bg-gray-50 text-gray-700 font-medium' : ''}`}
              >
                Disabled
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button size="sm" variant="outline" onClick={() => onEdit(item)} className="h-10 px-3 border-gray-200 hover:bg-gray-50 rounded-xl">
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => onDelete(item.id)} className="h-10 px-3 border-red-200 text-red-600 hover:bg-red-50 rounded-xl">
            <Trash2 className="h-4 w-4" />
          </Button>
          <div {...listeners} className="cursor-move p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <MoveVertical className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Main MenuBuilder component
const MenuBuilder = () => {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menuSections, setMenuSections] = useState<MenuSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [menuChanged, setMenuChanged] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [allExpanded, setAllExpanded] = useState(true);
  
  // Dialog states
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'section' | 'item'>();
  const [itemToDelete, setItemToDelete] = useState<{ sectionId: string; itemId: string; name: string } | null>(null);
  const [sectionToDelete, setSectionToDelete] = useState<{ id: string; name: string } | null>(null);
  const [currentSection, setCurrentSection] = useState<MenuSection | null>(null);
  const [currentSectionId, setCurrentSectionId] = useState<string>("");
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);

  // Form states
  const [sectionName, setSectionName] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemImageUrl, setItemImageUrl] = useState("");
  const [itemIsDisabled, setItemIsDisabled] = useState(false);
  const [itemOutOfStock, setItemOutOfStock] = useState(false);
  const [priceVariations, setPriceVariations] = useState<PriceVariation[]>([]);
  
  // Add this state for section price variations
  const [sectionPriceVariations, setSectionPriceVariations] = useState<string[]>([]);

  const { currentUser } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchRestaurantData = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    try {
      // Use get() instead of an implicit listener
      const restaurantRef = doc(db, 'restaurants', currentUser.uid);
      const restaurantDoc = await getDoc(restaurantRef);
      
      if (restaurantDoc.exists()) {
        const data = restaurantDoc.data();
        setRestaurant(data);
        setMenuSections(data.menuSections || []);
        setCurrencySymbol(data.currencySymbol || "₹");
      } else {
        toast({
          title: "Restaurant not found",
          description: "Please complete your restaurant profile first.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching restaurant data:", error);
      toast({
        title: "Error loading data",
        description: "Could not load your restaurant information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Updated useEffect with cleanup and proper subscription handling
  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchRestaurantData();

    // Only set up real-time listener if specifically needed
    // const unsubscribe = onSnapshot(doc(db, 'restaurants', currentUser.uid), (doc) => {
    //   if (doc.exists()) {
    //     const data = doc.data();
    //     setRestaurant(data);
    //     setMenuSections(data.menuSections || []);
    //     setCurrencySymbol(data.currencySymbol || "₹");
    //   }
    // });

    // return () => {
    //   unsubscribe();
    // };
  }, [currentUser?.uid]);

  useEffect(() => {
    const newExpandedSections: Record<string, boolean> = {};
    menuSections.forEach(section => {
      newExpandedSections[section.id] = expandedSections[section.id] ?? true;
    });
    setExpandedSections(newExpandedSections);
  }, [menuSections]);

  const handleSaveMenu = async () => {
    if (!currentUser) return;
    
    setSaving(true);
    try {
      await updateDoc(doc(db, 'restaurants', currentUser.uid), {
        menuSections,
        lastUpdated: new Date().toISOString()
      });
      
      setMenuChanged(false);
      toast({
        title: "Menu saved",
        description: "Your menu has been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving menu:", error);
      toast({
        title: "Error saving menu",
        description: "Could not save your menu changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const openAddSectionDialog = () => {
    setCurrentSection(null);
    setSectionName("");
    setSectionPriceVariations([]);
    setSectionDialogOpen(true);
  };

  const openEditSectionDialog = (section: MenuSection) => {
    setCurrentSection(section);
    setSectionName(section.name);
    setSectionPriceVariations(section.priceVariationCategories?.map(v => v.name) || []);
    setSectionDialogOpen(true);
  };

  const handleAddSectionVariation = () => {
    setSectionPriceVariations([...sectionPriceVariations, ""]);
  };

  const handleUpdateSectionVariation = (index: number, value: string) => {
    const updated = [...sectionPriceVariations];
    updated[index] = value;
    setSectionPriceVariations(updated);
  };

  const handleRemoveSectionVariation = (index: number) => {
    setSectionPriceVariations(sectionPriceVariations.filter((_, i) => i !== index));
  };

  const handleSaveSection = () => {
    if (!sectionName.trim()) {
      toast({
        title: "Section name required",
        description: "Please enter a name for this section.",
        variant: "destructive",
      });
      return;
    }

    // Filter out empty variation names
    const validVariations = sectionPriceVariations
      .map(name => name.trim())
      .filter(name => name.length > 0)
      .map(name => ({ id: uuidv4(), name }));

    if (currentSection) {
      // Edit existing section
      const updatedSections = menuSections.map(section =>
        section.id === currentSection.id
          ? { 
              ...section, 
              name: sectionName,
              priceVariationCategories: validVariations
            }
          : section
      );
      
      setMenuSections(updatedSections);
      toast({
        title: "Section updated",
        description: `"${sectionName}" has been updated.`,
      });
    } else {
      // Add new section
      const newSection: MenuSection = {
        id: uuidv4(),
        name: sectionName,
        items: [],
        isDisabled: false,
        priceVariationCategories: validVariations
      };
      
      setMenuSections([...menuSections, newSection]);
      toast({
        title: "Section added",
        description: `"${sectionName}" has been added to your menu.`,
      });
    }
    
    setSectionDialogOpen(false);
    setMenuChanged(true);
  };

  const handleDeleteSection = (sectionId: string) => {
    const section = menuSections.find(s => s.id === sectionId);
    if (!section) return;
    
    setDeleteType('section');
    setSectionToDelete({ id: sectionId, name: section.name });
    setDeleteDialogOpen(true);
  };

  const openAddItemDialog = (sectionId: string) => {
    setCurrentSectionId(sectionId);
    setCurrentItem(null);
    setItemName("");
    setItemDescription("");
    setItemPrice("");
    setItemImageUrl("");
    setItemIsDisabled(false);
    setItemOutOfStock(false);
    
    // Initialize price variations from section categories
    const section = menuSections.find(s => s.id === sectionId);
    if (section?.priceVariationCategories?.length) {
      setPriceVariations(
        section.priceVariationCategories.map(cat => ({
          name: cat.name,
          price: 0
        }))
      );
    } else {
      setPriceVariations([]);
    }
    
    setItemDialogOpen(true);
  };

  const openEditItemDialog = (sectionId: string, item: MenuItem) => {
    setCurrentSectionId(sectionId);
    setCurrentItem(item);
    setItemName(item.name);
    setItemDescription(item.description || "");
    setItemPrice(item.price?.toString() || "");
    setItemImageUrl(item.imageUrl || "");
    setItemIsDisabled(item.isDisabled || false);
    setItemOutOfStock(item.outOfStock || false);
    
    // Get section's variation categories
    const section = menuSections.find(s => s.id === sectionId);
    const sectionCategories = section?.priceVariationCategories || [];
    
    // Check if the item uses base price or variations
    if (item.priceVariations && item.priceVariations.length > 0) {
      // Item uses variations - match with section categories if available
      if (sectionCategories.length > 0) {
        const variations = sectionCategories.map(cat => {
          const existing = item.priceVariations?.find(v => v.name === cat.name);
          return {
            name: cat.name,
            price: existing?.price || 0
          };
        });
        setPriceVariations(variations);
      } else {
        setPriceVariations(item.priceVariations);
      }
    } else {
      // Item uses base price - don't initialize variations even if section has them
      setPriceVariations([]);
    }
    
    setItemDialogOpen(true);
  };

  const handleSaveItem = () => {
    if (!itemName.trim()) {
      toast({
        title: "Item name required",
        description: "Please enter a name for this item.",
        variant: "destructive",
      });
      return;
    }

    // Price validation
    let price = itemPrice === '' ? 0 : parseFloat(itemPrice);
    if (itemPrice !== '' && isNaN(price)) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid price.",
        variant: "destructive",
      });
      return;
    }

    // Check if we have valid price variations
    const hasValidVariations = priceVariations.length > 0 && 
      priceVariations.every(v => !isNaN(v.price) && v.price > 0);

    // If using variations, ensure all have valid prices
    if (priceVariations.length > 0 && !hasValidVariations) {
      toast({
        title: "Invalid variation prices",
        description: "Please enter valid prices for all variations.",
        variant: "destructive",
      });
      return;
    }

    // If no variations, require base price only if no valid price is set
    if (priceVariations.length === 0 && !price && itemPrice !== '0') {
      toast({
        title: "Price required",
        description: "Please enter a base price when not using variations.",
        variant: "destructive",
      });
      return;
    }

    const newItem = {
      id: currentItem?.id || uuidv4(),
      name: itemName.trim(),
      description: itemDescription?.trim() || "", // Empty string if not provided
      price: hasValidVariations ? 0 : price, // Use base price if no variations
      imageUrl: itemImageUrl?.trim() || "", // Empty string if not provided
      isDisabled: itemIsDisabled || false,
      outOfStock: itemOutOfStock || false,
      priceVariations: hasValidVariations ? priceVariations : [] // Empty array if not using variations
    };

    const sectionIndex = menuSections.findIndex(section => section.id === currentSectionId);
    if (sectionIndex === -1) {
      toast({
        title: "Error",
        description: "Could not find the section to add the item to.",
        variant: "destructive",
      });
      return;
    }

    const updatedSections = [...menuSections];
    const section = { ...updatedSections[sectionIndex] };
    
    if (currentItem) {
      // Edit existing item
      section.items = section.items.map(item =>
        item.id === currentItem.id ? newItem : item
      );
    } else {
      // Add new item
      section.items = section.items || [];
      section.items = [...section.items, newItem];
    }
    
    updatedSections[sectionIndex] = section;
    setMenuSections(updatedSections);
    setMenuChanged(true);
    
    toast({
      title: currentItem ? "Item updated" : "Item added",
      description: `"${itemName}" has been ${currentItem ? 'updated' : 'added to your menu'}.`,
    });
    
    setItemDialogOpen(false);
  };

  const handleDeleteItem = (sectionId: string, itemId: string) => {
    const section = menuSections.find(s => s.id === sectionId);
    const item = section?.items.find(i => i.id === itemId);
    if (!section || !item) return;

    setDeleteType('item');
    setItemToDelete({ sectionId, itemId, name: item.name });
    setDeleteDialogOpen(true);
  };

  const handleStatusChange = (sectionId: string, itemId: string, status: 'active' | 'disabled' | 'outOfStock') => {
    const sectionIndex = menuSections.findIndex(section => section.id === sectionId);
    if (sectionIndex === -1) return;

    const updatedSections = [...menuSections];
    const section = { ...updatedSections[sectionIndex] };
    
    section.items = section.items.map(item => {
      if (item.id === itemId) {
        switch(status) {
          case 'active':
            return { ...item, isDisabled: false, outOfStock: false };
          case 'disabled':
            return { ...item, isDisabled: true, outOfStock: false };
          case 'outOfStock':
            return { ...item, isDisabled: false, outOfStock: true };
          default:
            return item;
        }
      }
      return item;
    });
    
    updatedSections[sectionIndex] = section;
    setMenuSections(updatedSections);
    setMenuChanged(true);
    
    toast({
      title: `Item ${status === 'active' ? 'activated' : status === 'disabled' ? 'disabled' : 'marked out of stock'}`,
      description: `The item status has been updated.`,
    });
  };

  const handleToggleSectionDisabled = (sectionId: string, isDisabled: boolean) => {
    const updatedSections = menuSections.map(section =>
      section.id === sectionId ? { ...section, isDisabled } : section
    );
    
    setMenuSections(updatedSections);
    setMenuChanged(true);
    
    toast({
      title: isDisabled ? "Section hidden" : "Section visible",
      description: `The section has been ${isDisabled ? 'hidden from' : 'shown on'} the menu.`,
    });
  };

  const handleAddVariation = () => {
    setPriceVariations([
      ...priceVariations, 
      { name: "", price: 0 }
    ]);
  };

  const handleUpdateVariation = (index: number, field: keyof PriceVariation, value: string) => {
    const updated = [...priceVariations];
    if (field === 'name') {
      updated[index].name = value;
    } else if (field === 'price') {
      const price = value === '0' ? '' : value;
      updated[index].price = parseFloat(price) || 0;
    }
    setPriceVariations(updated);
  };

  const handleRemoveVariation = (index: number) => {
    // Don't allow removing the last variation if we're using variations (and no base price)
    const shouldPreventRemoval = priceVariations.length === 1 && !itemPrice;
    
    if (!shouldPreventRemoval) {
      setPriceVariations(priceVariations.filter((_, i) => i !== index));
    } else {
      toast({
        title: "Cannot remove all variations",
        description: "You must have at least one price option. Add a base price or keep at least one variation.",
        variant: "destructive",
      });
    }
  };

  const handleItemsReorder = (sectionId: string, items: MenuItem[]) => {
    const sectionIndex = menuSections.findIndex(section => section.id === sectionId);
    if (sectionIndex === -1) return;

    const updatedSections = [...menuSections];
    updatedSections[sectionIndex] = {
      ...updatedSections[sectionIndex],
      items
    };
    
    setMenuSections(updatedSections);
    setMenuChanged(true);
  };

  const handleSectionsReorder = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = menuSections.findIndex(section => section.id === active.id);
      const newIndex = menuSections.findIndex(section => section.id === over.id);
      
      setMenuSections(arrayMove(menuSections, oldIndex, newIndex));
      setMenuChanged(true);
    }
  };

  const handleToggleExpand = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleToggleAllSections = () => {
    const newExpandedState = !allExpanded;
    setAllExpanded(newExpandedState);
    
    const newExpandedSections: Record<string, boolean> = {};
    menuSections.forEach(section => {
      newExpandedSections[section.id] = newExpandedState;
    });
    setExpandedSections(newExpandedSections);
  };

  const confirmDelete = () => {
    if (deleteType === 'section' && sectionToDelete) {
      const updatedSections = menuSections.filter(section => section.id !== sectionToDelete.id);
      setMenuSections(updatedSections);
      setMenuChanged(true);
      
      toast({
        title: "Section deleted",
        description: "The section has been removed from your menu.",
      });
    } else if (deleteType === 'item' && itemToDelete) {
      const sectionIndex = menuSections.findIndex(section => section.id === itemToDelete.sectionId);
      if (sectionIndex === -1) return;

      const updatedSections = [...menuSections];
      const section = { ...updatedSections[sectionIndex] };
      
      section.items = section.items.filter(item => item.id !== itemToDelete.itemId);
      updatedSections[sectionIndex] = section;
      
      setMenuSections(updatedSections);
      setMenuChanged(true);
      
      toast({
        title: "Item deleted",
        description: "The item has been removed from the menu.",
      });
    }
    
    setDeleteDialogOpen(false);
    setDeleteType(undefined);
    setItemToDelete(null);
    setSectionToDelete(null);
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <RefreshCcw className="h-8 w-8 animate-spin text-black" />
          <p className="mt-4 text-lg text-black">Loading your menu builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="flex flex-col md:flex-row justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold font-display text-black">Menu Builder</h1>
          <p className="text-gray-600 mt-2">
            Organize your menu sections and items. Drag to reorder.
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-end md:items-center gap-3 mt-4 md:mt-0">
          {menuChanged && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="py-3 px-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <p className="text-sm text-amber-700">You have unsaved changes</p>
              </CardContent>
            </Card>
          )}
          <Button
            onClick={handleSaveMenu}
            disabled={!menuChanged || saving}
            className={`group bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors duration-200 ${saving ? '' : 'group bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors duration-200'}`}
          >
            {saving ? (
              <>
                <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2 group-hover:text-secondary-foreground" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {menuSections.length === 0 ? (
        <Card className="bg-gradient-to-br from-black-50/50 to-indigo-50/50 border-dashed border-2 border-black-200">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Building Your Menu</h3>
              <p className="text-gray-600 mb-6">Create sections to organize your menu items.</p>
              <Button onClick={openAddSectionDialog} className="bg-black hover:bg-gray-50 hover:text-black">
                <Plus className="h-4 w-4 mr-2" />
                Add First Section
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-end gap-3 mb-6">
            <Button
              variant="outline"
              onClick={handleToggleAllSections}
              className="flex items-center rounded-lg px-4 py-2 bg-white border-gray-200 hover:bg-gray-50 hover:text-black"
            >
              {allExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Collapse All
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Expand All
                </>
              )}
            </Button>
            <Button 
              onClick={openAddSectionDialog} 
              variant="outline" 
              className="flex items-center rounded-lg px-4 py-2 bg-white border-gray-200 hover:bg-gray-50 hover:text-black"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleSectionsReorder}
          >
            <SortableContext
              items={menuSections.map(section => section.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {menuSections.map(section => (
                  <SortableMenuSection
                    key={section.id}
                    section={section}
                    onEdit={openEditSectionDialog}
                    onDelete={handleDeleteSection}
                    onAddItem={openAddItemDialog}
                    onEditItem={openEditItemDialog}
                    onDeleteItem={handleDeleteItem}
                    onStatusChange={handleStatusChange}
                    onToggleSectionDisabled={handleToggleSectionDisabled}
                    onItemsReorder={handleItemsReorder}
                    currencySymbol={currencySymbol}
                    isExpanded={expandedSections[section.id] ?? true}
                    onToggleExpand={handleToggleExpand}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}

      {/* Section Dialog */}
      <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentSection ? 'Edit Section' : 'Add Section'}</DialogTitle>
            <DialogDescription>
              {currentSection ? 'Update the section details.' : 'Create a new section for your menu.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Section Name</Label>
              <Input
                id="name"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                placeholder="e.g., Appetizers, Main Course, Desserts"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Price Variations</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddSectionVariation}
                  className="h-8 px-2 border-gray-200 hover:bg-gray-50 hover:text-gray-700 rounded-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variation
                </Button>
              </div>
              
              {sectionPriceVariations.map((variation, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Input
                    value={variation}
                    onChange={(e) => handleUpdateSectionVariation(index, e.target.value)}
                    placeholder="e.g., Small, Medium, Large"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSectionVariation(index)}
                    className="group px-3 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 text-red-500 group-hover:text-red-700" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSectionDialogOpen(false)} className="hover:bg-gray-50 hover:text-black">
              Cancel
            </Button>
            <Button onClick={handleSaveSection} className="bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors duration-200">
              {currentSection ? 'Save Changes' : 'Add Section'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{currentItem ? 'Edit Item' : 'Add Item'}</DialogTitle>
            <DialogDescription>
              {currentItem ? 'Update the item details.' : 'Add a new item to this section.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g., Margherita Pizza"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="itemPrice">Base Price ({currencySymbol})</Label>
                <Input
                  id="itemPrice"
                  type="number"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value === '0' ? '' : e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  disabled={priceVariations.length > 0}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="itemDescription">Description</Label>
              <Textarea
                id="itemDescription"
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                placeholder="Describe your item..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="itemImageUrl">Image URL (Optional)</Label>
              <Input
                id="itemImageUrl"
                value={itemImageUrl}
                onChange={(e) => setItemImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            {/* Show section's price variations if available */}
            {(function PriceVariationsSection() {
              const section = menuSections.find(s => s.id === currentSectionId);
              const hasCategories = section?.priceVariationCategories?.length > 0;
              
              if (hasCategories) {
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Price Variations (Optional)</Label>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500">Using section's categories</p>
                        {priceVariations.length > 0 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setPriceVariations([])}
                            className="group h-8 px-2 text-red-600 hover:bg-red-50"
                          >
                            <span className="group-hover:text-red-700">Clear Variations</span>
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {priceVariations.length === 0 ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-15 border-dashed [&:hover]:bg-gray-50 [&:hover]:text-gray-700"
                        onClick={() => {
                          setPriceVariations(
                            section.priceVariationCategories.map(cat => ({
                              name: cat.name,
                              price: 0
                            }))
                          );
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Price Variations
                      </Button>
                    ) : (
                      priceVariations.map((variation, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <Input
                            value={variation.name}
                            disabled
                            className="flex-1 bg-gray-50"
                          />
                          <Input
                            type="number"
                            value={variation.price || ''}
                            onChange={(e) => handleUpdateVariation(index, 'price', e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            className="w-32"
                          />
                        </div>
                      ))
                    )}
                  </div>
                );
              }
              
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Custom Price Variations (Optional)</Label>
                    <div className="flex items-center gap-2">
                      {priceVariations.length > 0 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setPriceVariations([])}
                          className="group h-8 px-2 text-red-600 hover:bg-red-50"
                        >
                          <span className="group-hover:text-red-700">Clear All</span>
                        </Button>
                      )}
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={handleAddVariation}
                        className="h-8 px-2 [&:hover]:bg-gray-50 [&:hover]:text-gray-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Variation
                      </Button>
                    </div>
                  </div>
                  
                  {priceVariations.map((variation, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <Input
                        value={variation.name}
                        onChange={(e) => handleUpdateVariation(index, 'name', e.target.value)}
                        placeholder="Size/Variation name"
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={variation.price || ''}
                        onChange={(e) => handleUpdateVariation(index, 'price', e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        className="w-32"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveVariation(index)}
                        className="group px-3 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 text-red-500 group-hover:text-red-700" />
                      </Button>
                    </div>
                  ))}
                </div>
              );
            })()}

            <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="itemDisabled"
                  checked={itemIsDisabled}
                  onCheckedChange={setItemIsDisabled}
                  className="data-[state=checked]:bg-accent"
                />
                <Label htmlFor="itemDisabled">Disabled</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="itemOutOfStock"
                  checked={itemOutOfStock}
                  onCheckedChange={setItemOutOfStock}
                  className="data-[state=checked]:bg-accent"
                />
                <Label htmlFor="itemOutOfStock">Out of Stock</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialogOpen(false)} className="hover:bg-gray-50 hover:text-black">
              Cancel
            </Button>
            <Button onClick={handleSaveItem} className="bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors duration-200">
              {currentItem ? 'Save Changes' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              {deleteType === 'section' 
                ? `Are you sure you want to delete the section "${sectionToDelete?.name}"? This will also delete all items within this section.`
                : `Are you sure you want to delete the item "${itemToDelete?.name}"?`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              className="hover:bg-gray-50 hover:text-black"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmDelete}
              className="group bg-red-600 text-white hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2 group-hover:text-red-700" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MenuBuilder;
