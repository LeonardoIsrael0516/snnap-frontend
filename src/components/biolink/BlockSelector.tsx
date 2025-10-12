import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, Link, Link2, Heading, AlignLeft, User, Image, 
  Share2, Grid3x3, Minus, List, QrCode, Music, Video, 
  File, Megaphone, FileText, Mail, Phone, MessageSquare, 
  Map, Code, HelpCircle, AlertCircle, Timer, ShoppingBag, 
  Share, Star, Clock, Images, AtSign, Youtube, Music2,
  Twitter, FormInput, Contact, Palette, Clock3
} from "lucide-react";
import { blockCategories, createDefaultBlock, BiolinkBlock, BlockType } from "@/lib/biolinkBlocks";
import { isComingSoon } from "@/lib/comingSoonBlocks";

interface BlockSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectBlock: (block: BiolinkBlock) => void;
}

// Map icon names to actual icon components
const iconMap: Record<string, any> = {
  Link, Link2, Heading, AlignLeft, User, Image, 
  Share2, Grid3x3, Minus, List, QrCode, Music, Video,
  File, Megaphone, FileText, Mail, Phone, MessageSquare,
  Map, Code, HelpCircle, AlertCircle, Timer, ShoppingBag,
  Share, Star, Clock, Images, AtSign, Youtube, Music2,
  Twitter, FormInput, Contact, Palette
};

export function BlockSelector({ open, onOpenChange, onSelectBlock }: BlockSelectorProps) {
  const [search, setSearch] = useState("");

  const handleSelectBlock = (type: BlockType) => {
    if (isComingSoon(type)) {
      return; // Não permite selecionar blocos em desenvolvimento
    }
    
    const block = createDefaultBlock(type);
    onSelectBlock(block);
    onOpenChange(false);
    setSearch("");
  };

  const filteredCategories = Object.entries(blockCategories).map(([category, blocks]) => ({
    category,
    blocks: blocks.filter(block =>
      block.label.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(({ blocks }) => blocks.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Adicionar Bloco</DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar blocos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <ScrollArea className="h-[500px] pr-4">
          {filteredCategories.map(({ category, blocks }) => (
            <div key={category} className="mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                {category}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {blocks.map((block) => {
                  const IconComponent = iconMap[block.icon] || File;
                  const isBlockComingSoon = isComingSoon(block.type);
                  
                  return (
                    <button
                      key={block.type}
                      onClick={() => handleSelectBlock(block.type as BlockType)}
                      disabled={isBlockComingSoon}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border border-border transition-colors text-center ${
                        isBlockComingSoon 
                          ? 'opacity-60 cursor-not-allowed bg-gray-50' 
                          : 'hover:border-primary hover:bg-accent'
                      }`}
                    >
                      <IconComponent className="w-6 h-6 text-primary" />
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-medium">{block.label}</span>
                        {isBlockComingSoon && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                            <Clock3 className="w-3 h-3" />
                            Em breve
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

