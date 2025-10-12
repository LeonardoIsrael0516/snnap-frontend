import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function SkeletonCards() {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Suas páginas aparecerão aqui</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 w-6 bg-gray-200 rounded"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-20 bg-gray-200 rounded mb-3"></div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded flex-1"></div>
                <div className="h-8 bg-gray-200 rounded w-8"></div>
                <div className="h-8 bg-gray-200 rounded w-8"></div>
                <div className="h-8 bg-gray-200 rounded w-8"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}






