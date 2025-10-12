export type Language = 'pt-BR' | 'en-US' | 'es-ES';

export interface Translations {
  // Header
  header: {
    changeLanguage: string;
  };
  
  // Sidebar
  sidebar: {
    snapyboard: string;
    snapylink: string;
    snapyblocks: string;
    snapyshort: string;
    customDomains: string;
    referAndEarn: string;
    aiBadge: string;
  };
  
  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    view: string;
    copy: string;
    duplicate: string;
    create: string;
    back: string;
    next: string;
    previous: string;
    close: string;
    confirm: string;
  };
  
  // Link AI
  linkAI: {
    title: string;
    description: string;
    createNew: string;
    editPage: string;
    viewPage: string;
    duplicatePage: string;
    deletePage: string;
    exportPage: string;
    importPage: string;
    views: string;
    link: string;
    linkCopied: string;
    confirmDelete: string;
    deleteSuccess: string;
    duplicateSuccess: string;
    exportSuccess: string;
    importSuccess: string;
    errorLoading: string;
    errorCreating: string;
    errorUpdating: string;
    errorDeleting: string;
    errorDuplicating: string;
    errorExporting: string;
    errorImporting: string;
    invalidFile: string;
    selectFile: string;
    initialPrompt: string;
    promptHint: string;
    createFirst: string;
    shareSnapy: string;
  };
  
  // Biolinks (Snnap Blocks)
  biolinks: {
    title: string;
    description: string;
    createNew: string;
    editBlock: string;
    viewBlock: string;
    duplicateBlock: string;
    deleteBlock: string;
    views: string;
    link: string;
    linkCopied: string;
    confirmDelete: string;
    deleteSuccess: string;
    duplicateSuccess: string;
    errorLoading: string;
    errorCreating: string;
    errorUpdating: string;
    errorDeleting: string;
    errorDuplicating: string;
    createFirst: string;
    createNewBlock: string;
    slugPlaceholder: string;
    slugDescription: string;
    slugGenerated: string;
  };
  
  // User Menu
  userMenu: {
    settings: string;
    adminPanel: string;
    plansAndPayments: string;
    logout: string;
  };
}

export const translations: Record<Language, Translations> = {
  'pt-BR': {
    header: {
      changeLanguage: 'Alterar idioma',
    },
    sidebar: {
      snapyboard: 'Snnapboard',
      snapylink: 'Snnap',
      snapyblocks: 'Snnapblocks',
      snapyshort: 'Snnapshort',
      customDomains: 'Meus Domínios',
      referAndEarn: 'Indique e ganhe',
      aiBadge: 'IA',
    },
    common: {
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
      save: 'Salvar',
      cancel: 'Cancelar',
      delete: 'Excluir',
      edit: 'Editar',
      view: 'Ver',
      copy: 'Copiar',
      duplicate: 'Duplicar',
      create: 'Criar',
      back: 'Voltar',
      next: 'Próximo',
      previous: 'Anterior',
      close: 'Fechar',
      confirm: 'Confirmar',
    },
    linkAI: {
      title: 'Snapy',
      createNew: 'Criar nova página',
      editPage: 'Editar Página',
      viewPage: 'Ver Página',
      duplicatePage: 'Duplicar Página',
      deletePage: 'Excluir Página',
      exportPage: 'Exportar',
      importPage: 'Importar',
      views: 'visualizações',
      link: 'Link',
      linkCopied: 'Link copiado!',
      confirmDelete: 'Tem certeza que deseja excluir esta página?',
      deleteSuccess: 'Página excluída com sucesso!',
      duplicateSuccess: 'Página duplicada com sucesso!',
      exportSuccess: 'Página exportada com sucesso!',
      importSuccess: 'Página importada com sucesso!',
      errorLoading: 'Erro ao carregar páginas',
      errorCreating: 'Erro ao criar página',
      errorUpdating: 'Erro ao atualizar página',
      errorDeleting: 'Erro ao excluir página',
      errorDuplicating: 'Erro ao duplicar página',
      errorExporting: 'Erro ao exportar página',
      errorImporting: 'Erro ao importar página',
      invalidFile: 'Arquivo inválido. Selecione um arquivo .snapy',
      selectFile: 'Selecionar arquivo .snapy',
      initialPrompt: 'Prompt Inicial',
      promptHint: 'Dica: Seja o mais específico possível, descreva como quer sua página, cores, estilo, conteúdo, etc.',
      createFirst: 'Crie sua primeira página',
      shareSnapy: 'Compartilhar Snnap',
    },
    biolinks: {
      title: 'Snnap Blocks',
      description: 'Crie e gerencie seus biolinks com editor de blocos personalizados',
      createNew: 'Criar Novo Block',
      editBlock: 'Editar Block',
      viewBlock: 'Ver Block',
      duplicateBlock: 'Duplicar Block',
      deleteBlock: 'Excluir Block',
      views: 'visualizações',
      link: 'Link',
      linkCopied: 'Link copiado!',
      confirmDelete: 'Tem certeza que deseja excluir este block?',
      deleteSuccess: 'Block excluído com sucesso!',
      duplicateSuccess: 'Block duplicado com sucesso!',
      errorLoading: 'Erro ao carregar blocks',
      errorCreating: 'Erro ao criar block',
      errorUpdating: 'Erro ao atualizar block',
      errorDeleting: 'Erro ao excluir block',
      errorDuplicating: 'Erro ao duplicar block',
      createFirst: 'Crie seu primeiro Snnap Block',
      createNewBlock: 'Criar Novo Block',
      slugPlaceholder: 'Ex: meu-block',
      slugDescription: 'Insira o slug para seu block (opcional - será gerado automaticamente se deixado em branco)',
      slugGenerated: 'Um slug será gerado automaticamente',
    },
    userMenu: {
      settings: 'Configurações',
      adminPanel: 'Painel Admin',
      plansAndPayments: 'Planos e Pagamentos',
      logout: 'Sair',
    },
  },
  'en-US': {
    header: {
      changeLanguage: 'Change language',
    },
    sidebar: {
      snapyboard: 'Snnapboard',
      snapylink: 'Snnap',
      snapyblocks: 'Snnapblocks',
      snapyshort: 'Snnapshort',
      customDomains: 'Custom Domains',
      referAndEarn: 'Refer & Earn',
      aiBadge: 'AI',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      copy: 'Copy',
      duplicate: 'Duplicate',
      create: 'Create',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      close: 'Close',
      confirm: 'Confirm',
    },
    linkAI: {
      title: 'Snapy',
      createNew: 'Create new page',
      editPage: 'Edit Page',
      viewPage: 'View Page',
      duplicatePage: 'Duplicate Page',
      deletePage: 'Delete Page',
      exportPage: 'Export',
      importPage: 'Import',
      views: 'views',
      link: 'Link',
      linkCopied: 'Link copied!',
      confirmDelete: 'Are you sure you want to delete this page?',
      deleteSuccess: 'Page deleted successfully!',
      duplicateSuccess: 'Page duplicated successfully!',
      exportSuccess: 'Page exported successfully!',
      importSuccess: 'Page imported successfully!',
      errorLoading: 'Error loading pages',
      errorCreating: 'Error creating page',
      errorUpdating: 'Error updating page',
      errorDeleting: 'Error deleting page',
      errorDuplicating: 'Error duplicating page',
      errorExporting: 'Error exporting page',
      errorImporting: 'Error importing page',
      invalidFile: 'Invalid file. Please select a .snapy file',
      selectFile: 'Select .snapy file',
      initialPrompt: 'Initial Prompt',
      promptHint: 'Tip: Be as specific as possible, describe how you want your page, colors, style, content, etc.',
      createFirst: 'Create your first page',
      shareSnapy: 'Share Snnaplink',
    },
    biolinks: {
      title: 'Snnap Blocks',
      description: 'Create and manage your biolinks with custom block editor',
      createNew: 'Create New Block',
      editBlock: 'Edit Block',
      viewBlock: 'View Block',
      duplicateBlock: 'Duplicate Block',
      deleteBlock: 'Delete Block',
      views: 'views',
      link: 'Link',
      linkCopied: 'Link copied!',
      confirmDelete: 'Are you sure you want to delete this block?',
      deleteSuccess: 'Block deleted successfully!',
      duplicateSuccess: 'Block duplicated successfully!',
      errorLoading: 'Error loading blocks',
      errorCreating: 'Error creating block',
      errorUpdating: 'Error updating block',
      errorDeleting: 'Error deleting block',
      errorDuplicating: 'Error duplicating block',
      createFirst: 'Create your first Snnap Block',
      createNewBlock: 'Create New Block',
      slugPlaceholder: 'Ex: my-block',
      slugDescription: 'Enter the slug for your block (optional - will be generated automatically if left blank)',
      slugGenerated: 'A slug will be generated automatically',
    },
    userMenu: {
      settings: 'Settings',
      adminPanel: 'Admin Panel',
      plansAndPayments: 'Plans & Payments',
      logout: 'Logout',
    },
  },
  'es-ES': {
    header: {
      changeLanguage: 'Cambiar idioma',
    },
    sidebar: {
      snapyboard: 'Snnapboard',
      snapylink: 'Snnap',
      snapyblocks: 'Snnaplocks',
      snapyshort: 'Snnapshort',
      customDomains: 'Dominios Personalizados',
      referAndEarn: 'Referir y Ganar',
      aiBadge: 'IA',
    },
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      view: 'Ver',
      copy: 'Copiar',
      duplicate: 'Duplicar',
      create: 'Crear',
      back: 'Atrás',
      next: 'Siguiente',
      previous: 'Anterior',
      close: 'Cerrar',
      confirm: 'Confirmar',
    },
    linkAI: {
      title: 'Snapy',
      createNew: 'Crear nueva página',
      editPage: 'Editar Página',
      viewPage: 'Ver Página',
      duplicatePage: 'Duplicar Página',
      deletePage: 'Eliminar Página',
      exportPage: 'Exportar',
      importPage: 'Importar',
      views: 'visualizaciones',
      link: 'Enlace',
      linkCopied: '¡Enlace copiado!',
      confirmDelete: '¿Estás seguro de que quieres eliminar esta página?',
      deleteSuccess: '¡Página eliminada con éxito!',
      duplicateSuccess: '¡Página duplicada con éxito!',
      exportSuccess: '¡Página exportada con éxito!',
      importSuccess: '¡Página importada con éxito!',
      errorLoading: 'Error al cargar páginas',
      errorCreating: 'Error al crear página',
      errorUpdating: 'Error al actualizar página',
      errorDeleting: 'Error al eliminar página',
      errorDuplicating: 'Error al duplicar página',
      errorExporting: 'Error al exportar página',
      errorImporting: 'Error al importar página',
      invalidFile: 'Archivo inválido. Selecciona un archivo .snapy',
      selectFile: 'Seleccionar archivo .snapy',
      initialPrompt: 'Prompt Inicial',
      promptHint: 'Consejo: Sé lo más específico posible, describe cómo quieres tu página, colores, estilo, contenido, etc.',
      createFirst: 'Crea tu primera página',
      shareSnapy: 'Compartir Snnapink',
    },
    biolinks: {
      title: 'Snnap Blocks',
      description: 'Crea y gestiona tus biolinks con editor de bloques personalizado',
      createNew: 'Crear Nuevo Block',
      editBlock: 'Editar Block',
      viewBlock: 'Ver Block',
      duplicateBlock: 'Duplicar Block',
      deleteBlock: 'Eliminar Block',
      views: 'visualizaciones',
      link: 'Enlace',
      linkCopied: '¡Enlace copiado!',
      confirmDelete: '¿Estás seguro de que quieres eliminar este block?',
      deleteSuccess: '¡Block eliminado con éxito!',
      duplicateSuccess: '¡Block duplicado con éxito!',
      errorLoading: 'Error al cargar blocks',
      errorCreating: 'Error al crear block',
      errorUpdating: 'Error al actualizar block',
      errorDeleting: 'Error al eliminar block',
      errorDuplicating: 'Error al duplicar block',
      createFirst: 'Crea tu primer Snnap Block',
      createNewBlock: 'Crear Nuevo Block',
      slugPlaceholder: 'Ej: mi-block',
      slugDescription: 'Ingresa el slug para tu block (opcional - se generará automáticamente si se deja en blanco)',
      slugGenerated: 'Un slug se generará automáticamente',
    },
    userMenu: {
      settings: 'Configuración',
      adminPanel: 'Panel Admin',
      plansAndPayments: 'Planes y Pagos',
      logout: 'Cerrar Sesión',
    },
  },
};

export const getBrowserLanguage = (): Language => {
  const browserLang = navigator.language || navigator.languages?.[0] || 'pt-BR';
  
  // Mapear idiomas do navegador para nossos idiomas suportados
  if (browserLang.startsWith('pt')) return 'pt-BR';
  if (browserLang.startsWith('en')) return 'en-US';
  if (browserLang.startsWith('es')) return 'es-ES';
  
  // Fallback para português brasileiro
  return 'pt-BR';
};

export const getStoredLanguage = (): Language => {
  const stored = localStorage.getItem('snapy-language');
  if (stored && ['pt-BR', 'en-US', 'es-ES'].includes(stored)) {
    return stored as Language;
  }
  return getBrowserLanguage();
};

export const setStoredLanguage = (language: Language): void => {
  localStorage.setItem('snapy-language', language);
};
