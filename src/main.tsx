import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initAuthService } from "./lib/authService";

// Inicializar serviço de autenticação (renovação automática de tokens)
initAuthService();

createRoot(document.getElementById("root")!).render(<App />);
