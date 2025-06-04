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
import { Edit, MoveVertical, Trash2, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
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

const StatusButton = ({ status, className }: { status: 'active' | 'disabled' | 'outOfStock', className?: string }) => {
  const statusConfig = {
    active: {
      text: 'Active',
      className: 'bg-green-50 text-green-700 border-green-200 group-hover:bg-green-100',
      iconClass: 'group-hover:text-green-700'
    },
    outOfStock: {
      text: 'Out of Stock',
      className: 'bg-orange-50/50 text-orange-700 border-orange-200/70 group-hover:bg-orange-100/50',
      iconClass: 'group-hover:text-orange-700'
    },
    disabled: {
      text: 'Disabled',
      className: 'bg-gray-50 text-gray-700 border-gray-200 group-hover:bg-gray-100',
      iconClass: 'group-hover:text-gray-700'
    },
  };
/* Check if the status is active, outOfStock, or disabled */
  const config = statusConfig[status];

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 ${config.className} ${className}`}>
      <span className="text-sm font-medium whitespace-nowrap">{config.text}</span>
    </div>
  );
};

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
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const isMobile = useIsMobile();
  
  const getItemStatus = (): 'active' | 'disabled' | 'outOfStock' => {
    if (item.isDisabled) return 'disabled';
    if (item.outOfStock) return 'outOfStock';
    return 'active';
  };

  const style: CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    zIndex: isDragging ? 1000 : 'auto',
    position: isDragging ? 'relative' : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      data-sortable="true"
      className={`group bg-white rounded-lg border border-gray-200 mb-3 p-3 ${item.isDisabled ? 'opacity-60' : ''} ${isDragging ? 'rotate-2' : ''}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate text-gray-900">
            {item.name}
          </div>
          {item.description && (
            <div className="text-sm text-gray-500 truncate mt-1">{item.description}</div>
          )}
          <div className="text-primary font-bold mt-2 sm:hidden">
            {item.priceVariations && item.priceVariations.length > 0 ? (
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger>
                    <span className="text-green-600">
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
              item.price ? <span className="text-green-600">{currencySymbol}{item.price.toFixed(2)}</span> : <span className="text-gray-400">-</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 mt-2 sm:mt-0">
          <div className="text-primary font-bold hidden sm:block">
            {item.priceVariations && item.priceVariations.length > 0 ? (
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger>
                    <span className="text-green-600">
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
              item.price ? <span className="text-green-600">{currencySymbol}{item.price.toFixed(2)}</span> : <span className="text-gray-400">-</span>
            )}
          </div>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost"
                className="group h-8 p-0 hover:bg-transparent focus:bg-transparent active:bg-transparent"
              >
                <StatusButton status={getItemStatus()} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40" sideOffset={4}>
              <DropdownMenuItem 
                onClick={() => onStatusChange(item.id, 'active')}
                className="cursor-pointer flex items-center gap-2 text-green-700 hover:bg-green-50 hover:text-green-700 focus:bg-green-50 focus:text-green-700"
              >
                Active
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onStatusChange(item.id, 'outOfStock')}
                className="cursor-pointer flex items-center gap-2 text-orange-600 hover:bg-orange-50 hover:text-orange-700 focus:bg-orange-50 focus:text-orange-700"
              >
    
                Out of Stock
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onStatusChange(item.id, 'disabled')}
                className="cursor-pointer flex items-center gap-2 text-gray-700 hover:bg-gray-50 hover:text-gray-700 focus:bg-gray-50 focus:text-gray-700"
              >
                Disabled
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onEdit(item)} 
            className="h-10 w-10 sm:h-8 sm:w-8 p-0 border-gray-200 hover:bg-gray-50 hover:text-gray-700 rounded-lg"
          >
            <Edit className="h-4 w-4 text-gray-700" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => onDelete(item.id)} className="group h-10 w-10 sm:h-8 sm:w-8 p-0 border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 hover:border-red-300">
            <Trash2 className="h-4 w-4 group-hover:text-red-700" />
          </Button>
          <div 
            {...listeners} 
            className="cursor-move p-2 sm:p-1.5 rounded-lg hover:bg-gray-100 hover:text-gray-700"
          >
            <MoveVertical className="h-4 w-4 text-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
}; 