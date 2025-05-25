import { MenuItem } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreVertical, MoveVertical, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useIsMobile } from "@/hooks/use-mobile";
import type { CSSProperties } from 'react';

interface SortableMenuItemProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: 'active' | 'disabled' | 'outOfStock') => void;
  currencySymbol: string;
}

export const SortableMenuItem = ({ 
  item, 
  onEdit, 
  onDelete,
  onStatusChange,
  currencySymbol
}: SortableMenuItemProps) => {
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

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`bg-white rounded-lg border border-gray-200 mb-3 p-3 ${item.isDisabled ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center">
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate flex items-center gap-3 text-gray-900">
            {item.name}
            {item.outOfStock && (
              <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">Out of Stock</span>
            )}
            {item.isDisabled && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">Disabled</span>
            )}
          </div>
          {item.description && (
            <div className="text-sm text-gray-500 truncate mt-1">{item.description}</div>
          )}
        </div>

        <div className="flex items-center gap-3 ml-3">
          <div className="text-primary font-bold">
            {item.priceVariations && item.priceVariations.length > 0 ? (
              <span className="text-green-600">{`${currencySymbol}${item.priceVariations[0].price.toFixed(2)}+`}</span>
            ) : (
              item.price ? <span className="text-green-600">{currencySymbol}{item.price.toFixed(2)}</span> : <span className="text-gray-400">-</span>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size="sm" 
                variant="outline"
                className="h-8 px-2 border-gray-200 hover:bg-gray-50 hover:text-gray-700 rounded-lg"
              >
                <MoreVertical className="h-4 w-4 text-gray-700" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem 
                onClick={() => onStatusChange(item.id, 'active')}
                className={`cursor-pointer !text-gray-600 focus:!bg-gray-50 focus:!text-gray-700 ${
                  getItemStatus() === 'active' 
                    ? '!bg-green-50 !text-green-700 font-medium' 
                    : 'hover:!bg-gray-50 hover:!text-gray-700'
                }`}
              >
                Active
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onStatusChange(item.id, 'outOfStock')}
                className={`cursor-pointer !text-gray-600 focus:!bg-gray-50 focus:!text-gray-700 ${
                  getItemStatus() === 'outOfStock' 
                    ? '!bg-orange-50 !text-orange-700 font-medium' 
                    : 'hover:!bg-gray-50 hover:!text-gray-700'
                }`}
              >
                Out of Stock
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onStatusChange(item.id, 'disabled')}
                className={`cursor-pointer !text-gray-600 focus:!bg-gray-50 focus:!text-gray-700 ${
                  getItemStatus() === 'disabled' 
                    ? '!bg-gray-100 !text-gray-700 font-medium' 
                    : 'hover:!bg-gray-50 hover:!text-gray-700'
                }`}
              >
                Disabled
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button size="sm" variant="outline" onClick={() => onEdit(item)} className="h-8 px-2 border-gray-200 hover:bg-gray-50 hover:text-gray-700 rounded-lg">
            <Edit className="h-4 w-4 text-gray-700" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => onDelete(item.id)} className="h-8 px-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg">
            <Trash2 className="h-4 w-4" />
          </Button>
          <div {...listeners} className="cursor-move p-1.5 rounded-lg hover:bg-gray-100 hover:text-gray-700">
            <MoveVertical className="h-4 w-4 text-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
}; 