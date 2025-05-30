import { MenuItem } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit, MoreVertical, Trash2 } from "lucide-react";

interface MenuItemProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: 'active' | 'disabled' | 'outOfStock') => void;
  currencySymbol: string;
}

export const MenuItemComponent = ({
  item,
  onEdit,
  onDelete,
  onStatusChange,
  currencySymbol
}: MenuItemProps) => {
  const getItemStatus = (): 'active' | 'disabled' | 'outOfStock' => {
    if (item.isDisabled) return 'disabled';
    if (item.outOfStock) return 'outOfStock';
    return 'active';
  };

  return (
    <div className={`bg-white rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-blue-200 p-4 sm:p-6 ${item.isDisabled ? 'opacity-60' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start gap-2">
            <div className="font-bold text-lg truncate flex items-center gap-2 text-gray-900">
              {item.name}
              {item.outOfStock && (
                <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">Out of Stock</span>
              )}
              {item.isDisabled && (
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">Disabled</span>
              )}
            </div>
            <div className="text-primary font-bold sm:ml-2">
              {item.priceVariations && item.priceVariations.length > 0 ? (
                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger>
                      <span className="text-green-600 text-xl">
                        {currencySymbol}{item.priceVariations[0].price.toFixed(2)}+
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        {item.priceVariations.map((variation) => (
                          <div key={variation.name} className="whitespace-nowrap">
                            {variation.name}: {currencySymbol}{variation.price.toFixed(2)}
                          </div>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                item.price ? <span className="text-green-600 text-xl">{currencySymbol}{item.price.toFixed(2)}</span> : <span className="text-gray-400">-</span>
              )}
            </div>
          </div>
          {item.description && (
            <div className="text-sm text-gray-600 truncate mt-2 leading-relaxed">{item.description}</div>
          )}
        </div>
        
        <div className="flex items-center justify-end gap-2 sm:gap-3 mt-2 sm:mt-0 sm:ml-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size="sm" 
                variant="outline"
                className="h-10 w-10 sm:h-10 sm:w-10 p-0 border-gray-200 hover:bg-gray-50 rounded-xl"
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
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onEdit(item)} 
            className="h-10 w-10 sm:h-10 sm:w-10 p-0 border-gray-200 hover:bg-gray-50 rounded-xl"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onDelete(item.id)} 
            className="h-10 w-10 sm:h-10 sm:w-10 p-0 border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}; 