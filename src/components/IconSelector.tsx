import { useState } from "react";
import { 
  Folder, 
  Star, 
  Heart, 
  Zap, 
  Globe, 
  Palette, 
  Camera, 
  Music, 
  Gamepad2, 
  Book, 
  Briefcase, 
  Home, 
  ShoppingBag, 
  Car, 
  Plane, 
  Coffee, 
  Utensils, 
  Gift, 
  Trophy, 
  Target, 
  Lightbulb, 
  Rocket, 
  Diamond, 
  Crown, 
  Sparkles, 
  Flame, 
  Snowflake, 
  Sun, 
  Moon, 
  Cloud, 
  TreePine, 
  Flower, 
  Leaf, 
  Apple, 
  Pizza, 
  Cake, 
  Wine, 
  Beer, 
  Coffee as CoffeeIcon, 
  Phone, 
  Mail, 
  MessageCircle, 
  Users, 
  User, 
  UserPlus, 
  Settings, 
  Wrench, 
  Hammer, 
  Scissors, 
  Paintbrush, 
  Pen, 
  Pencil, 
  Eraser, 
  FileText, 
  File, 
  FolderOpen, 
  Archive, 
  Download, 
  Upload, 
  Share, 
  Link, 
  Lock, 
  Unlock, 
  Shield, 
  Key, 
  Bell, 
  Clock, 
  Calendar, 
  MapPin, 
  Navigation, 
  Compass, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Eye, 
  EyeOff, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Image, 
  Images, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  FileCode, 
  Code, 
  Terminal, 
  Database, 
  Server, 
  Cpu, 
  HardDrive, 
  Monitor, 
  Laptop, 
  Smartphone, 
  Tablet, 
  Headphones, 
  Speaker, 
  Tv, 
  Radio, 
  Wifi, 
  Bluetooth, 
  Battery, 
  BatteryCharging, 
  Plug, 
  Power, 
  Trash2, 
  Trash, 
  X, 
  Check, 
  Plus, 
  Minus, 
  Edit, 
  Copy, 
  Save, 
  RefreshCw, 
  RotateCcw, 
  RotateCw, 
  Move, 
  Maximize, 
  Minimize, 
  Maximize2, 
  Minimize2, 
  ExternalLink, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal, 
  MoreVertical, 
  Menu, 
  X as XIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface IconSelectorProps {
  value: string;
  onChange: (icon: string) => void;
  placeholder?: string;
}

// Biblioteca de ícones organizados por categoria
const iconCategories = {
  "Geral": [
    { name: "Pasta", icon: Folder, value: "folder" },
    { name: "Estrela", icon: Star, value: "star" },
    { name: "Coração", icon: Heart, value: "heart" },
    { name: "Raio", icon: Zap, value: "zap" },
    { name: "Globo", icon: Globe, value: "globe" },
    { name: "Paleta", icon: Palette, value: "palette" },
    { name: "Câmera", icon: Camera, value: "camera" },
    { name: "Música", icon: Music, value: "music" },
    { name: "Controle", icon: Gamepad2, value: "gamepad" },
    { name: "Livro", icon: Book, value: "book" },
    { name: "Maleta", icon: Briefcase, value: "briefcase" },
    { name: "Casa", icon: Home, value: "home" },
    { name: "Sacola", icon: ShoppingBag, value: "shopping" },
    { name: "Carro", icon: Car, value: "car" },
    { name: "Avião", icon: Plane, value: "plane" },
    { name: "Café", icon: Coffee, value: "coffee" },
    { name: "Comida", icon: Utensils, value: "utensils" },
    { name: "Presente", icon: Gift, value: "gift" },
    { name: "Troféu", icon: Trophy, value: "trophy" },
    { name: "Alvo", icon: Target, value: "target" },
    { name: "Lâmpada", icon: Lightbulb, value: "lightbulb" },
    { name: "Foguete", icon: Rocket, value: "rocket" },
    { name: "Diamante", icon: Diamond, value: "diamond" },
    { name: "Coroa", icon: Crown, value: "crown" },
    { name: "Brilho", icon: Sparkles, value: "sparkles" },
    { name: "Chama", icon: Flame, value: "flame" },
  ],
  "Natureza": [
    { name: "Floco", icon: Snowflake, value: "snowflake" },
    { name: "Sol", icon: Sun, value: "sun" },
    { name: "Lua", icon: Moon, value: "moon" },
    { name: "Nuvem", icon: Cloud, value: "cloud" },
    { name: "Pinheiro", icon: TreePine, value: "tree" },
    { name: "Flor", icon: Flower, value: "flower" },
    { name: "Folha", icon: Leaf, value: "leaf" },
    { name: "Maçã", icon: Apple, value: "apple" },
  ],
  "Comida": [
    { name: "Pizza", icon: Pizza, value: "pizza" },
    { name: "Bolo", icon: Cake, value: "cake" },
    { name: "Vinho", icon: Wine, value: "wine" },
    { name: "Cerveja", icon: Beer, value: "beer" },
    { name: "Xícara", icon: CoffeeIcon, value: "coffee-cup" },
  ],
  "Comunicação": [
    { name: "Telefone", icon: Phone, value: "phone" },
    { name: "Email", icon: Mail, value: "mail" },
    { name: "Mensagem", icon: MessageCircle, value: "message" },
    { name: "Usuários", icon: Users, value: "users" },
    { name: "Usuário", icon: User, value: "user" },
    { name: "Adicionar", icon: UserPlus, value: "user-plus" },
  ],
  "Ferramentas": [
    { name: "Configurações", icon: Settings, value: "settings" },
    { name: "Chave", icon: Wrench, value: "wrench" },
    { name: "Martelo", icon: Hammer, value: "hammer" },
    { name: "Tesoura", icon: Scissors, value: "scissors" },
    { name: "Pincel", icon: Paintbrush, value: "paintbrush" },
    { name: "Caneta", icon: Pen, value: "pen" },
    { name: "Lápis", icon: Pencil, value: "pencil" },
    { name: "Borracha", icon: Eraser, value: "eraser" },
  ],
  "Arquivos": [
    { name: "Documento", icon: FileText, value: "file-text" },
    { name: "Arquivo", icon: File, value: "file" },
    { name: "Pasta Aberta", icon: FolderOpen, value: "folder-open" },
    { name: "Arquivo", icon: Archive, value: "archive" },
    { name: "Download", icon: Download, value: "download" },
    { name: "Upload", icon: Upload, value: "upload" },
    { name: "Compartilhar", icon: Share, value: "share" },
    { name: "Link", icon: Link, value: "link" },
  ],
  "Segurança": [
    { name: "Cadeado", icon: Lock, value: "lock" },
    { name: "Desbloqueado", icon: Unlock, value: "unlock" },
    { name: "Escudo", icon: Shield, value: "shield" },
    { name: "Chave", icon: Key, value: "key" },
    { name: "Sino", icon: Bell, value: "bell" },
  ],
  "Tempo": [
    { name: "Relógio", icon: Clock, value: "clock" },
    { name: "Calendário", icon: Calendar, value: "calendar" },
    { name: "Localização", icon: MapPin, value: "map-pin" },
    { name: "Navegação", icon: Navigation, value: "navigation" },
    { name: "Bússola", icon: Compass, value: "compass" },
  ],
  "Interface": [
    { name: "Buscar", icon: Search, value: "search" },
    { name: "Filtro", icon: Filter, value: "filter" },
    { name: "Grade", icon: Grid, value: "grid" },
    { name: "Lista", icon: List, value: "list" },
    { name: "Olho", icon: Eye, value: "eye" },
    { name: "Olho Fechado", icon: EyeOff, value: "eye-off" },
  ],
  "Mídia": [
    { name: "Play", icon: Play, value: "play" },
    { name: "Pausa", icon: Pause, value: "pause" },
    { name: "Voltar", icon: SkipBack, value: "skip-back" },
    { name: "Avançar", icon: SkipForward, value: "skip-forward" },
    { name: "Volume", icon: Volume2, value: "volume" },
    { name: "Mudo", icon: VolumeX, value: "volume-x" },
    { name: "Microfone", icon: Mic, value: "mic" },
    { name: "Microfone Off", icon: MicOff, value: "mic-off" },
    { name: "Vídeo", icon: Video, value: "video" },
    { name: "Vídeo Off", icon: VideoOff, value: "video-off" },
    { name: "Imagem", icon: Image, value: "image" },
    { name: "Imagens", icon: Images, value: "images" },
  ],
  "Tecnologia": [
    { name: "Código", icon: Code, value: "code" },
    { name: "Terminal", icon: Terminal, value: "terminal" },
    { name: "Banco", icon: Database, value: "database" },
    { name: "Servidor", icon: Server, value: "server" },
    { name: "CPU", icon: Cpu, value: "cpu" },
    { name: "HD", icon: HardDrive, value: "hard-drive" },
    { name: "Monitor", icon: Monitor, value: "monitor" },
    { name: "Laptop", icon: Laptop, value: "laptop" },
    { name: "Celular", icon: Smartphone, value: "smartphone" },
    { name: "Tablet", icon: Tablet, value: "tablet" },
    { name: "Fone", icon: Headphones, value: "headphones" },
    { name: "Caixa", icon: Speaker, value: "speaker" },
    { name: "TV", icon: Tv, value: "tv" },
    { name: "Rádio", icon: Radio, value: "radio" },
    { name: "WiFi", icon: Wifi, value: "wifi" },
    { name: "Bluetooth", icon: Bluetooth, value: "bluetooth" },
    { name: "Bateria", icon: Battery, value: "battery" },
    { name: "Carregando", icon: BatteryCharging, value: "battery-charging" },
    { name: "Plug", icon: Plug, value: "plug" },
    { name: "Power", icon: Power, value: "power" },
  ],
  "Ações": [
    { name: "Lixeira", icon: Trash2, value: "trash" },
    { name: "X", icon: X, value: "x" },
    { name: "Check", icon: Check, value: "check" },
    { name: "Mais", icon: Plus, value: "plus" },
    { name: "Menos", icon: Minus, value: "minus" },
    { name: "Editar", icon: Edit, value: "edit" },
    { name: "Copiar", icon: Copy, value: "copy" },
    { name: "Salvar", icon: Save, value: "save" },
    { name: "Atualizar", icon: RefreshCw, value: "refresh" },
    { name: "Rotacionar", icon: RotateCcw, value: "rotate" },
    { name: "Mover", icon: Move, value: "move" },
    { name: "Maximizar", icon: Maximize, value: "maximize" },
    { name: "Minimizar", icon: Minimize, value: "minimize" },
    { name: "Link Externo", icon: ExternalLink, value: "external-link" },
  ],
  "Setas": [
    { name: "Seta Cima", icon: ArrowUp, value: "arrow-up" },
    { name: "Seta Baixo", icon: ArrowDown, value: "arrow-down" },
    { name: "Seta Esquerda", icon: ArrowLeft, value: "arrow-left" },
    { name: "Seta Direita", icon: ArrowRight, value: "arrow-right" },
    { name: "Chevron Cima", icon: ChevronUp, value: "chevron-up" },
    { name: "Chevron Baixo", icon: ChevronDown, value: "chevron-down" },
    { name: "Chevron Esquerda", icon: ChevronLeft, value: "chevron-left" },
    { name: "Chevron Direita", icon: ChevronRight, value: "chevron-right" },
    { name: "Mais Horizontal", icon: MoreHorizontal, value: "more-horizontal" },
    { name: "Mais Vertical", icon: MoreVertical, value: "more-vertical" },
    { name: "Menu", icon: Menu, value: "menu" },
  ]
};

export function IconSelector({ value, onChange, placeholder = "Selecione um ícone" }: IconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  console.log('IconSelector renderizado:', { value, isOpen });

  // Encontrar o ícone selecionado
  const selectedIcon = Object.values(iconCategories)
    .flat()
    .find(icon => icon.value === value);

  // Filtrar ícones baseado na busca
  const filteredCategories = Object.entries(iconCategories).reduce((acc, [categoryName, icons]) => {
    const filteredIcons = icons.filter(icon => 
      icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      icon.value.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (filteredIcons.length > 0) {
      acc[categoryName] = filteredIcons;
    }
    
    return acc;
  }, {} as typeof iconCategories);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          console.log('Botão clicado, abrindo modal');
          setIsOpen(true);
        }}
        className="w-full justify-start h-10"
      >
        {selectedIcon ? (
          <>
            <selectedIcon.icon className="w-4 h-4 mr-2" />
            {selectedIcon.name}
          </>
        ) : (
          placeholder
        )}
      </Button>

      {isOpen && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="w-[90vw] max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>Selecionar Ícone</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Search */}
              <Input
                placeholder="Buscar ícones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* Icons Grid */}
              <ScrollArea className="h-[60vh]">
                <div className="space-y-6">
                  {Object.entries(filteredCategories).map(([categoryName, icons]) => (
                    <div key={categoryName}>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                        {categoryName}
                      </h3>
                      <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-2">
                        {icons.map((icon) => {
                          const IconComponent = icon.icon;
                          const isSelected = value === icon.value;
                          
                          return (
                            <Button
                              key={icon.value}
                              type="button"
                              variant={isSelected ? "default" : "outline"}
                              size="sm"
                              className="h-12 w-12 p-0 flex flex-col items-center justify-center"
                              onClick={() => {
                                console.log('Ícone selecionado:', icon.value);
                                onChange(icon.value);
                                setIsOpen(false);
                              }}
                              title={icon.name}
                            >
                              <IconComponent className="w-5 h-5" />
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
