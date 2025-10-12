// Types and management for biolink blocks
export type BlockType =
  | 'links'
  | 'title'
  | 'paragraph'
  | 'avatar'
  | 'image'
  | 'social-media'
  | 'image-grid'
  | 'divider'
  | 'list'
  | 'pix'
  | 'audio'
  | 'video'
  | 'file'
  | 'cta'
  | 'pdf'
  | 'email-collector'
  | 'phone-collector'
  | 'contact-form'
  | 'map'
  | 'custom-html'
  | 'rss-feed'
  | 'vcard'
  | 'alert'
  | 'faq'
  | 'countdown'
  | 'product'
  | 'share'
  | 'youtube-feed'
  | 'timeline'
  | 'review'
  | 'image-slider'
  | 'threads'
  | 'spotify'
  | 'youtube'
  | 'twitch'
  | 'vimeo'
  | 'tiktok-video'
  | 'apple-music'
  | 'x-profile'
  | 'x-tweet'
  | 'x-video'
  | 'pinterest-profile'
  | 'instagram-media'
  | 'tiktok-profile'
  | 'typeform'
  | 'discord-server'
  | 'facebook-post'
  | 'reddit-post'
  | 'image-builder';

export interface BiolinkBlock {
  id: string;
  type: BlockType;
  data: Record<string, any>;
  order: number;
}

export interface BiolinkSettings {
  slug: string;
  pageTitle?: string;
  background: {
    type: 'color' | 'gradient' | 'image' | 'video';
    value: string;
    gradientFrom?: string;
    gradientTo?: string;
    gradientMiddle?: string; // Terceira cor
    gradientType?: 'linear' | 'radial' | 'conic'; // Tipo de gradiente
    gradientDirection?: string; // Direção personalizada (ex: "45deg", "to right", "circle at center")
    blur?: number;
  };
  favicon?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  metaTitle?: string;
  metaDescription?: string;
  pixels?: {
    facebookPixel?: string;
    googleAnalytics?: string;
    googleTagManager?: string;
    tiktokPixel?: string;
    linkedinPixel?: string;
    twitterPixel?: string;
  };
  customCode?: string;
}

export const blockCategories = {
  'Conteúdo Básico': [
    { type: 'links', label: 'Links', icon: 'Link2' },
    { type: 'title', label: 'Título', icon: 'Heading' },
    { type: 'paragraph', label: 'Parágrafo', icon: 'AlignLeft' },
    { type: 'avatar', label: 'Avatar', icon: 'User' },
    { type: 'image', label: 'Imagem', icon: 'Image' },
  ],
  'Mídia': [
    { type: 'audio', label: 'Áudio', icon: 'Music' },
    { type: 'video', label: 'Vídeo', icon: 'Video' },
    { type: 'file', label: 'Arquivo', icon: 'File' },
    { type: 'pdf', label: 'Documento PDF', icon: 'FileText' },
    { type: 'image-grid', label: 'Grade de Imagens', icon: 'Grid3x3' },
    { type: 'image-slider', label: 'Slider de Imagens', icon: 'Images' },
    { type: 'image-builder', label: 'Builder de Imagem', icon: 'Palette' },
  ],
  'Social': [
    { type: 'social-media', label: 'Redes Sociais', icon: 'Share2' },
    { type: 'youtube', label: 'YouTube', icon: 'Youtube' },
    { type: 'spotify', label: 'Spotify', icon: 'Music' },
    { type: 'instagram-media', label: 'Mídia do Instagram', icon: 'Instagram' },
    { type: 'tiktok-video', label: 'Vídeo TikTok', icon: 'Music2' },
    { type: 'x-profile', label: 'Perfil do X', icon: 'Twitter' },
    { type: 'x-tweet', label: 'Tweet do X', icon: 'MessageSquare' },
    { type: 'threads', label: 'Threads', icon: 'AtSign' },
  ],
  'Formulários': [
    { type: 'email-collector', label: 'Coletor de Email', icon: 'Mail' },
    { type: 'phone-collector', label: 'Coletor de Telefone', icon: 'Phone' },
    { type: 'contact-form', label: 'Formulário de Contato', icon: 'MessageSquare' },
    { type: 'typeform', label: 'Typeform', icon: 'FormInput' },
  ],
  'Outros': [
    { type: 'divider', label: 'Divisor', icon: 'Minus' },
    { type: 'list', label: 'Lista', icon: 'List' },
    { type: 'pix', label: 'PIX', icon: 'QrCode' },
    { type: 'cta', label: 'Chamada para Ação', icon: 'Megaphone' },
    { type: 'map', label: 'Mapa', icon: 'Map' },
    { type: 'custom-html', label: 'HTML Personalizado', icon: 'Code' },
    { type: 'vcard', label: 'vCard', icon: 'Contact' },
    { type: 'alert', label: 'Alerta', icon: 'AlertCircle' },
    { type: 'faq', label: 'FAQ', icon: 'HelpCircle' },
    { type: 'countdown', label: 'Contagem Regressiva', icon: 'Timer' },
    { type: 'product', label: 'Produto', icon: 'ShoppingBag' },
    { type: 'share', label: 'Compartilhar', icon: 'Share' },
    { type: 'review', label: 'Review', icon: 'Star' },
    { type: 'timeline', label: 'Linha do Tempo', icon: 'Clock' },
  ],
} as const;

export function generateBlockId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function createDefaultBlock(type: BlockType): BiolinkBlock {
  const defaults: Record<BlockType, Record<string, any>> = {
    'links': { 
      links: [{ 
        text: 'Link 1', 
        url: 'https://', 
        backgroundColor: '#000000', 
        textColor: '#ffffff', 
        icon: '', 
        iconType: 'none',
        openInNewTab: true 
      }], 
      columns: 1, 
      showIcons: false 
    },
    'title': { 
      text: 'Título', 
      level: 'h2', 
      color: '#000000', 
      columns: 1, 
      alignment: 'center',
      showIcon: false, 
      iconType: 'none', 
      icon: '',
      titles: [
        {
          text: 'Título 1',
          level: 'h2',
          color: '#000000',
          showIcon: false,
          iconType: 'none',
          icon: ''
        }
      ]
    },
    'paragraph': { 
      text: 'Digite seu texto aqui',
      color: '#000000',
      backgroundColor: 'transparent',
      opacity: 100,
      borderRadius: 0,
      padding: 16
    },
    'avatar': { 
      imageUrl: '', 
      alt: 'Avatar',
      shape: 'circle',
      borderColor: 'transparent',
      borderWidth: 0
    },
    'image': { 
      images: [
        { imageUrl: '', alt: 'Imagem', link: '' }
      ],
      size: 'banner',
      columns: 1
    },
    'social-media': { platforms: [] },
    'image-grid': { images: [] },
    'divider': { style: 'solid' },
    'list': { items: ['Item 1', 'Item 2'] },
    'pix': { key: '', qrCode: '' },
    'audio': { url: '' },
    'video': { url: '', platform: 'custom' },
    'file': { url: '', name: 'Arquivo' },
    'cta': { text: 'Clique aqui', url: 'https://', style: 'primary' },
    'pdf': { url: '', name: 'Documento' },
    'email-collector': { placeholder: 'Seu email', buttonText: 'Inscrever' },
    'phone-collector': { placeholder: 'Seu telefone', buttonText: 'Enviar' },
    'contact-form': { fields: ['name', 'email', 'message'] },
    'map': { address: '', lat: 0, lng: 0 },
    'custom-html': { html: '<p>Seu HTML aqui</p>' },
    'rss-feed': { url: '' },
    'vcard': { name: '', phone: '', email: '' },
    'alert': { text: 'Alerta', type: 'info' },
    'faq': { items: [{ question: 'Pergunta?', answer: 'Resposta' }] },
    'countdown': { targetDate: new Date().toISOString(), text: 'Contagem' },
    'product': { name: '', price: '', image: '', url: '' },
    'share': { url: '', text: 'Compartilhe' },
    'youtube-feed': { channelId: '' },
    'timeline': { events: [] },
    'review': { rating: 5, author: '', text: '' },
    'image-slider': { images: [] },
    'threads': { postUrl: '' },
    'spotify': { type: 'track', id: '' },
    'youtube': { videoId: '' },
    'twitch': { channel: '' },
    'vimeo': { videoId: '' },
    'tiktok-video': { videoUrl: '' },
    'apple-music': { songUrl: '' },
    'x-profile': { username: '' },
    'x-tweet': { tweetUrl: '' },
    'x-video': { videoUrl: '' },
    'pinterest-profile': { username: '' },
    'instagram-media': { postUrl: '' },
    'tiktok-profile': { username: '' },
    'typeform': { formId: '' },
    'discord-server': { inviteCode: '' },
    'facebook-post': { postUrl: '' },
    'reddit-post': { postUrl: '' },
    'image-builder': { 
      width: 800, 
      height: 400, 
      backgroundColor: '#ffffff',
      elements: [],
      backgroundImage: null,
      backgroundType: 'color' // 'color', 'image', 'gradient'
    },
  };

  return {
    id: generateBlockId(),
    type,
    data: defaults[type] || {},
    order: 0,
  };
}
