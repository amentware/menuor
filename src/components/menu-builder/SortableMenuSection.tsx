import { MenuSection, MenuItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Edit, MoveVertical, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableMenuItem } from "./SortableMenuItem";
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
import type { CSSProperties } from 'react';
import { useState } from 'react';

interface SortableMenuSectionProps {
  section: MenuSection;
  onEdit: (section: MenuSection) => void;
  onDelete: (id: string) => void;
  onAddItem: (sectionId: string) => void;
  onEditItem: (sectionId: string, item: MenuItem) => void;
  onDeleteItem: (sectionId: string, itemId: string) => void;
  onStatusChange: (sectionId: string, itemId: string, status: 'active' | 'disabled' | 'outOfStock') => void;
  onToggleSectionDisabled: (sectionId: string, disabled: boolean) => void;
  onItemsReorder: (sectionId: string, items: MenuItem[]) => void;
  currencySymbol: string;
  isExpanded: boolean;
  onToggleExpand: (sectionId: string) => void;
}

export const SortableMenuSection = ({
  section,
  onEdit,
  onDelete,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onStatusChange,
  onToggleSectionDisabled,
  onItemsReorder,
  currencySymbol,
  isExpanded,
  onToggleExpand
}: SortableMenuSectionProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section.id });

  // Fix the transform to only include translate, removing scale
  const style: CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    zIndex: isDragging ? 1000 : 'auto',
    position: isDragging ? 'relative' : undefined,
  };

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = section.items.findIndex(item => item.id === active.id);
      const newIndex = section.items.findIndex(item => item.id === over.id);
      
      const newItems = arrayMove(section.items, oldIndex, newIndex);
      onItemsReorder(section.id, newItems);
    }
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`mb-2 border-b border-gray-100 ${section.isDisabled ? 'opacity-60' : ''} ${isDragging ? 'shadow-2xl rotate-2' : ''} w-full overflow-hidden`}
    >
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0 py-3 px-3 sticky top-0 bg-white z-10 border-b rounded-t-lg">
        <div className="flex items-center gap-3">
          <div {...listeners} {...attributes} className="cursor-move p-2 rounded-lg hover:bg-gray-100 hover:text-gray-700">
            <MoveVertical className="h-5 w-5 text-gray-700" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl font-bold truncate">{section.name}</CardTitle>
            <div className="flex flex-wrap items-center gap-2 text-sm mt-1">
              <span className="text-gray-500">{section.items.length} items</span>
              {section.priceVariationCategories && section.priceVariationCategories.length > 0 && (
                <>
                  <span className="text-gray-400 hidden sm:inline">•</span>
                  <div className="flex flex-wrap gap-1 w-full sm:w-auto mt-1 sm:mt-0">
                    {section.priceVariationCategories.map((cat, index) => (
                      <span key={cat.id} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onToggleExpand(section.id)}
            className="h-8 w-8 p-0 hover:bg-gray-100 hover:text-gray-700 rounded-lg ml-2"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-700" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-700" />
            )}
          </Button>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 mr-2 sm:mr-4 flex-1 sm:flex-none">
            <Switch
              checked={!section.isDisabled}
              onCheckedChange={(checked) => onToggleSectionDisabled(section.id, !checked)}
            />
            <span className="text-sm text-gray-600 whitespace-nowrap">
              {section.isDisabled ? 'Disabled' : 'Active'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onAddItem(section.id)} 
              className="h-9 sm:h-8 px-3 sm:px-2 border-gray-200 hover:bg-gray-50 hover:text-gray-700 rounded-lg flex-1 sm:flex-none"
            >
              <Plus className="h-4 w-4 sm:mr-0 mr-2" />
              <span className="sm:hidden">Add Item</span>
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onEdit(section)} 
              className="h-9 sm:h-8 w-9 sm:w-8 p-0 border-gray-200 hover:bg-gray-50 hover:text-gray-700 rounded-lg"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onDelete(section.id)} 
              className="h-9 sm:h-8 w-9 sm:w-8 p-0 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={`p-3 ${!isExpanded ? 'hidden' : ''}`}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={section.items.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {section.items.length > 0 ? (
                section.items.map(item => (
                  <SortableMenuItem
                    key={item.id}
                    item={item}
                    onEdit={(item) => onEditItem(section.id, item)}
                    onDelete={(itemId) => onDeleteItem(section.id, itemId)}
                    onStatusChange={(itemId, status) => onStatusChange(section.id, itemId, status)}
                    currencySymbol={currencySymbol}
                  />
                ))
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-gray-500 mb-3">No items in this section</p>
                  <Button 
                    variant="outline" 
                    onClick={() => onAddItem(section.id)}
                    className="border-gray-200 text-black hover:bg-gray-50 hover:text-gray-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Item
                  </Button>
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
};