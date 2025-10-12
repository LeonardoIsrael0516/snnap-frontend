import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

interface Example {
  title: string;
  description: string;
  category: string;
  image: string;
  prompt: string;
}

const examples: Example[] = [
  {
    title: "Portfolio Pessoal",
    description: "Uma página profissional para mostrar seu trabalho",
    category: "Profissional",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    prompt: "Crie uma página de portfolio pessoal moderna com seções para sobre mim, projetos e contato"
  },
  {
    title: "Loja Online",
    description: "Página de vendas para seu produto ou serviço",
    category: "E-commerce",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
    prompt: "Crie uma landing page de vendas para um curso online com preços e depoimentos"
  },
  {
    title: "Evento Especial",
    description: "Convite digital para casamento, aniversário ou evento",
    category: "Eventos",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop",
    prompt: "Crie um convite digital elegante para um casamento com informações do evento"
  },
  {
    title: "Blog Pessoal",
    description: "Compartilhe suas ideias e experiências",
    category: "Blog",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop",
    prompt: "Crie um blog pessoal sobre viagens com seções para posts e galeria de fotos"
  },
  {
    title: "Restaurante",
    description: "Menu digital e informações do seu restaurante",
    category: "Gastronomia",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
    prompt: "Crie uma página para restaurante com menu, localização e reservas"
  },
  {
    title: "ONG/Projeto Social",
    description: "Divulgue sua causa e arrecade doações",
    category: "Social",
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=300&fit=crop",
    prompt: "Crie uma página para ONG com informações sobre a causa e como ajudar"
  }
];

interface ExamplesCarouselProps {
  onSelectExample: (prompt: string) => void;
}

export function ExamplesCarousel({ onSelectExample }: ExamplesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % examples.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + examples.length) % examples.length);
  };

  const currentExample = examples[currentIndex];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Inspire-se com exemplos</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevSlide}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextSlide}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="relative">
          <img
            src={currentExample.image}
            alt={currentExample.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-3 left-3">
            <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
              {currentExample.category}
            </span>
          </div>
        </div>
        <CardContent className="p-4">
          <h4 className="font-semibold mb-1">{currentExample.title}</h4>
          <p className="text-sm text-gray-600 mb-3">{currentExample.description}</p>
          <Button
            onClick={() => onSelectExample(currentExample.prompt)}
            className="w-full gradient-instagram text-white"
            size="sm"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Usar este exemplo
          </Button>
        </CardContent>
      </Card>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {examples.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? "bg-purple-500" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}






