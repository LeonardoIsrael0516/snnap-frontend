import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BiolinkBlock, BlockType } from "@/lib/biolinkBlocks";
import { LinksEditor } from "./editors/LinksEditor";
import { TitleEditor } from "./editors/TitleEditor";
import { ParagraphEditor } from "./editors/ParagraphEditor";
import { AvatarEditor } from "./editors/AvatarEditor";
import { ImageEditor } from "./editors/ImageEditor";
import { SocialMediaEditor } from "./editors/SocialMediaEditor";
import { DividerEditor } from "./editors/DividerEditor";
import { CTAEditor } from "./editors/CTAEditor";
import { ImageBuilderEditor } from "./editors/ImageBuilderEditor";

interface BlockEditorProps {
  block: BiolinkBlock | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (block: BiolinkBlock) => void;
}

export function BlockEditor({ block, open, onOpenChange, onSave }: BlockEditorProps) {
  const [editedBlock, setEditedBlock] = useState<BiolinkBlock | null>(block);

  // Sync state when block prop changes
  useEffect(() => {
    setEditedBlock(block);
  }, [block]);

  const handleSave = () => {
    if (editedBlock) {
      onSave(editedBlock);
      onOpenChange(false);
    }
  };

  const updateBlockData = (data: Record<string, any>) => {
    if (editedBlock) {
      setEditedBlock({ ...editedBlock, data });
    }
  };

  if (!editedBlock) return null;

  const getEditorComponent = () => {
    switch (editedBlock.type) {
      case 'links':
        return <LinksEditor data={editedBlock.data} onChange={updateBlockData} />;
      case 'title':
        return <TitleEditor data={editedBlock.data} onChange={updateBlockData} />;
      case 'paragraph':
        return <ParagraphEditor data={editedBlock.data} onChange={updateBlockData} />;
      case 'avatar':
        return <AvatarEditor data={editedBlock.data} onChange={updateBlockData} />;
      case 'image':
        return <ImageEditor data={editedBlock.data} onChange={updateBlockData} />;
      case 'social-media':
        return <SocialMediaEditor data={editedBlock.data} onChange={updateBlockData} />;
      case 'divider':
        return <DividerEditor data={editedBlock.data} onChange={updateBlockData} />;
      case 'cta':
        return <CTAEditor data={editedBlock.data} onChange={updateBlockData} />;
      case 'image-builder':
        return <ImageBuilderEditor data={editedBlock.data} onChange={updateBlockData} />;
      default:
        return (
          <div className="p-4 text-center text-muted-foreground">
            Editor para "{editedBlock.type}" em desenvolvimento
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="capitalize">
            Editar {editedBlock.type.replace(/-/g, ' ')}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {getEditorComponent()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="gradient-instagram text-white">
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
