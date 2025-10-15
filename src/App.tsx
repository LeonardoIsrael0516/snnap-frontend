import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { debugEnvVars, validateApiUrls } from "@/utils/debug";
import { Layout } from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
// Páginas principais
import Landing from "./pages/Landing";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

// Módulos organizados
import { Login } from "./pages/auth";
import { LinkAI, LinkAICreate } from "./pages/link-ai";
import { Biolinks, BiolinkEditor } from "./pages/biolink";
import { ViewPage } from "./pages/public";
import { Admin, AdminUsers, StorageConfig, PlansManager, UserPlansManager } from "./pages/admin";
import TemplateManager from "./pages/admin/TemplateManager";
import CustomDomains from "./pages/CustomDomains";
import { PageAnalytics } from "./pages/analytics";
import Sugestoes from "./pages/Sugestoes";
import SuggestionsAdmin from "./pages/admin/SuggestionsAdmin";
import PaymentTest from "./pages/PaymentTest";

const queryClient = new QueryClient();

const App = () => {
  // Debug environment variables
  React.useEffect(() => {
    debugEnvVars();
    validateApiUrls();
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={
            <PublicRoute>
              <Landing />
            </PublicRoute>
          } />
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes with layout */}
          <Route path="/link-ai" element={
            <ProtectedRoute>
              <Layout><LinkAI /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/link-ai/create" element={
            <ProtectedRoute>
              <Layout hideBottomNav><LinkAICreate /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/link-ai/edit/:id" element={
            <ProtectedRoute>
              <Layout hideBottomNav><LinkAICreate /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/biolinks" element={
            <ProtectedRoute>
              <Layout><Biolinks /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/biolink/editor" element={
            <ProtectedRoute>
              <Layout hideBottomNav><BiolinkEditor /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/biolink/editor/:id" element={
            <ProtectedRoute>
              <Layout hideBottomNav><BiolinkEditor /></Layout>
            </ProtectedRoute>
          } />
          
          {/* Teste de Pagamento */}
          <Route path="/payment-test" element={
            <ProtectedRoute>
              <Layout><PaymentTest /></Layout>
            </ProtectedRoute>
          } />
          
          
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <Layout><Admin /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute adminOnly>
              <Layout><AdminUsers /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/storage" element={
            <ProtectedRoute adminOnly>
              <Layout><StorageConfig /></Layout>
            </ProtectedRoute>
          } />
              <Route path="/admin/suggestions" element={
                <ProtectedRoute adminOnly>
                  <Layout><SuggestionsAdmin /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/templates" element={
                <ProtectedRoute adminOnly>
                  <Layout><TemplateManager /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/plans" element={
                <ProtectedRoute adminOnly>
                  <Layout><PlansManager /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/user-plans" element={
                <ProtectedRoute adminOnly>
                  <Layout><UserPlansManager /></Layout>
                </ProtectedRoute>
              } />
          
          {/* Other protected routes */}
          <Route path="/short-links" element={
            <ProtectedRoute>
              <Layout><ComingSoon /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/biohub" element={
            <ProtectedRoute>
              <Layout><ComingSoon /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/dominios" element={
            <ProtectedRoute>
              <Layout><CustomDomains /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/analytics/:pageId" element={
            <ProtectedRoute>
              <Layout><PageAnalytics /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/sugestoes" element={
            <ProtectedRoute>
              <Layout><Sugestoes /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/pixels" element={
            <ProtectedRoute>
              <Layout><ComingSoon /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/leads" element={
            <ProtectedRoute>
              <Layout><ComingSoon /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/planos" element={
            <ProtectedRoute>
              <Layout><ComingSoon /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/configuracoes" element={
            <ProtectedRoute>
              <Layout><ComingSoon /></Layout>
            </ProtectedRoute>
          } />
          
          {/* 404 route */}
          <Route path="/404" element={<NotFound />} />
          
          {/* Public page route - must be last */}
          <Route path="/:slug" element={<ViewPage />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
