import { MenuItem } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    <div className={`bg-white rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-blue-200 p-6 ${item.isDisabled ? 'opacity-60' : ''}`}>
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
        
        <div className="flex items-center gap-3 ml-4">
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
        </div>
      </div>
    </div>
  );
}; 