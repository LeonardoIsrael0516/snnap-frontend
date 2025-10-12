import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/snap-sidebar-g.png" 
                alt="Snapy" 
                className="h-8 w-auto object-contain"
              />
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-slate-300 hover:text-white transition-colors font-medium"
              >
                Login
              </Link>
              <Link
                to="/login"
                className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Começar
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Bem-vindo ao{" "}
            <span className="gradient-instagram-text">Snapy</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Crie páginas incríveis com o poder da IA. 
            Transforme suas ideias em realidade em segundos.
          </p>
          <div className="space-x-4">
            <Link
              to="/login"
              className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity inline-block"
            >
              Começar Agora
            </Link>
            <button className="border border-slate-600 text-slate-300 px-8 py-3 rounded-lg font-semibold hover:bg-slate-800/50 transition-colors">
              Saiba Mais
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}






