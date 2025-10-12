// Lista de blocos que estão em desenvolvimento e não podem ser selecionados
export const comingSoonBlocks: string[] = [
  'image-builder'
];

// Função para verificar se um bloco está em desenvolvimento
export function isComingSoon(blockType: string): boolean {
  return comingSoonBlocks.includes(blockType);
}

// Função para obter a mensagem de "Em breve" para um bloco
export function getComingSoonMessage(blockType: string): string {
  const messages: Record<string, string> = {
    'image-builder': 'Editor de imagem avançado em desenvolvimento'
  };
  
  return messages[blockType] || 'Em breve';
}
