import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Smartphone, 
  Zap, 
  Wifi, 
  Download, 
  Bell, 
  Star,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";

interface PWAOnboardingProps {
  open: boolean;
  onClose: () => void;
}

const onboardingSteps = [
  {
    icon: Smartphone,
    title: "O que é PWA?",
    description: "Progressive Web App (PWA) transforma sua página em um aplicativo instalável!",
    features: [
      "Funciona como um app nativo no celular e desktop",
      "Aparece na tela inicial dos dispositivos",
      "Abre em tela cheia, sem barra de navegador",
      "Experiência profissional e moderna"
    ],
    color: "from-blue-500 to-indigo-600"
  },
  {
    icon: Zap,
    title: "Performance Lightning Fast ⚡",
    description: "PWAs são extremamente rápidos e responsivos",
    features: [
      "Carregamento instantâneo após instalação",
      "Cache inteligente de recursos",
      "Transições suaves entre páginas",
      "Menor consumo de dados"
    ],
    color: "from-yellow-500 to-orange-600"
  },
  {
    icon: Wifi,
    title: "Funciona Offline 🔌",
    description: "Continue navegando mesmo sem internet!",
    features: [
      "Conteúdo disponível offline",
      "Cache automático de páginas visitadas",
      "Sincronização quando voltar online",
      "Experiência contínua e confiável"
    ],
    color: "from-green-500 to-emerald-600"
  },
  {
    icon: Download,
    title: "Fácil de Instalar 📲",
    description: "Seus visitantes podem instalar com 1 clique",
    features: [
      "Banner de instalação automático",
      "Não precisa de App Store ou Play Store",
      "Instalação em segundos",
      "Atualizações automáticas"
    ],
    color: "from-purple-500 to-pink-600"
  },
  {
    icon: Bell,
    title: "Engajamento Máximo 🎯",
    description: "Mantenha seus usuários sempre conectados",
    features: [
      "Ícone na tela inicial = mais visitas",
      "Notificações push (em breve)",
      "Experiência imersiva em tela cheia",
      "Maior taxa de retorno"
    ],
    color: "from-red-500 to-rose-600"
  },
  {
    icon: Star,
    title: "Por que usar PWA? 🚀",
    description: "Benefícios comprovados para seu negócio",
    features: [
      "↑ 50% de engajamento dos usuários",
      "↑ 300% de conversões em média",
      "↓ 90% de espaço vs apps nativos",
      "SEO melhorado = mais visitas orgânicas"
    ],
    color: "from-cyan-500 to-blue-600"
  }
];

export function PWAOnboarding({ open, onClose }: PWAOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const step = onboardingSteps[currentStep];
  const Icon = step.icon;
  const isFirst = currentStep === 0;
  const isLast = currentStep === onboardingSteps.length - 1;

  const handleNext = () => {
    if (!isLast) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {/* Header com gradiente */}
        <div className={`bg-gradient-to-r ${step.color} p-8 text-white relative`}>
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 animate-pulse">
              <Icon className="w-10 h-10" />
            </div>
            <DialogTitle className="text-3xl font-bold mb-2">
              {step.title}
            </DialogTitle>
            <DialogDescription className="text-white/90 text-lg">
              {step.description}
            </DialogDescription>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            {step.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                style={{
                  animation: `slideInFromRight 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${step.color} mt-2 flex-shrink-0`} />
                <p className="text-gray-700 font-medium">{feature}</p>
              </div>
            ))}
          </div>

          {/* Indicadores de progresso */}
          <div className="flex justify-center gap-2 pt-4">
            {onboardingSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-gradient-to-r ' + step.color
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Navegação */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={isFirst}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>

            <span className="text-sm text-gray-500">
              {currentStep + 1} de {onboardingSteps.length}
            </span>

            <Button
              onClick={handleNext}
              className={`gap-2 bg-gradient-to-r ${step.color} hover:opacity-90`}
            >
              {isLast ? 'Começar!' : 'Próximo'}
              {!isLast && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <style>{`
          @keyframes slideInFromRight {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
