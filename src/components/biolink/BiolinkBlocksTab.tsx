import { useState } from "react";
import { Plus, GripVertical, Trash2, Edit, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BiolinkBlock } from "@/lib/biolinkBlocks";
import { BlockSelector } from "./BlockSelector";
import { BlockEditor } from "./BlockEditor";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface BiolinkBlocksTabProps {
  blocks: BiolinkBlock[];
  onBlocksChange: (blocks: BiolinkBlock[]) => void;
}

function SortableBlockItem({ block, onEdit, onDelete, onDuplicate }: { 
  block: BiolinkBlock; 
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="p-4 mb-3">
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-medium capitalize">{block.type.replace(/-/g, ' ')}</p>
            <p className="text-xs text-muted-foreground">
              {JSON.stringify(block.data).substring(0, 50)}...
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDuplicate}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function BiolinkBlocksTab({ blocks, onBlocksChange }: BiolinkBlocksTabProps) {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<BiolinkBlock | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      onBlocksChange(arrayMove(blocks, oldIndex, newIndex));
    }
  };

  const handleAddBlock = (block: BiolinkBlock) => {
    setEditingBlock(block);
    setEditorOpen(true);
  };

  const handleSaveBlock = (block: BiolinkBlock) => {
    const existingIndex = blocks.findIndex(b => b.id === block.id);
    if (existingIndex >= 0) {
      // Update existing block
      const newBlocks = [...blocks];
      newBlocks[existingIndex] = block;
      onBlocksChange(newBlocks);
    } else {
      // Add new block
      onBlocksChange([...blocks, { ...block, order: blocks.length }]);
    }
    setEditingBlock(null);
    setEditorOpen(false);
  };

  const handleEditBlock = (block: BiolinkBlock) => {
    setEditingBlock(block);
    setEditorOpen(true);
  };

  const handleDeleteBlock = (id: string) => {
    onBlocksChange(blocks.filter(b => b.id !== id));
  };

  const handleDuplicateBlock = (block: BiolinkBlock) => {
    const duplicatedBlock: BiolinkBlock = {
      ...block,
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      order: blocks.length
    };
    onBlocksChange([...blocks, duplicatedBlock]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Blocos</h3>
        <Button onClick={() => setSelectorOpen(true)} className="gradient-instagram text-white">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Bloco
        </Button>
      </div>

      {blocks.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
          <Plus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">Nenhum bloco adicionado</p>
          <Button onClick={() => setSelectorOpen(true)} variant="outline">
            Adicionar Primeiro Bloco
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={blocks.map(b => b.id)}
            strategy={verticalListSortingStrategy}
          >
            {blocks.map((block) => (
              <SortableBlockItem
                key={block.id}
                block={block}
                onEdit={() => handleEditBlock(block)}
                onDuplicate={() => handleDuplicateBlock(block)}
                onDelete={() => handleDeleteBlock(block.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}

      <BlockSelector
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        onSelectBlock={handleAddBlock}
      />

      <BlockEditor
        block={editingBlock}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSave={handleSaveBlock}
      />
    </div>
  );
}
