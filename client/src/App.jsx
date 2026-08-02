import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import NavBar, { HeroNavBar } from "./components/NavBar";
import ScrollRevealManager from "./components/ScrollRevealManager";
import HomePage from "./pages/HomePage";
import ListingsPage from "./pages/ListingsPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import BranchesPage from "./pages/BranchesPage";
import AppraisalsPage from "./pages/AppraisalsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ServicesPage from "./pages/ServicesPage";
import { BRAND } from "./config/brand";

const WHATSAPP_URL =
  `${BRAND.whatsappHref}?text=Hola%20REEX%20Inmobiliaria,%20quisiera%20hacer%20una%20consulta.`;

function AppRoutes() {
  return (
    <Routes>
      {/* Home uses HeroNavBar so the hero image wraps nav + content */}
      <Route element={<HeroNavBar />}>
        <Route path="/" element={<HomePage />} />
      </Route>
      {/* All other routes use the plain NavBar */}
      <Route element={<NavBar />}>
      <Route path="/propiedades/ficha/:slug" element={<PropertyDetailPage />} />
      <Route path="/:section/:status" element={<ListingsPage />} />
      <Route path="/sucursales" element={<BranchesPage />} />
      <Route path="/servicios" element={<ServicesPage />} />
      <Route path="/tasaciones" element={<AppraisalsPage />} />
      <Route path="/nosotros" element={<AboutPage />} />
      <Route path="/contacto" element={<ContactPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/properties" element={<AdminDashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function WhatsAppFloatingButton() {
  return (
    <a
      href={WHATSAPP_URL}
      className="whatsapp-float"
      target="_blank"
      rel="noreferrer"
      aria-label="Abrir chat de WhatsApp"
    >
      <i className="fa-brands fa-whatsapp" aria-hidden="true" />
    </a>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollRevealManager />
      <AppRoutes />
      <WhatsAppFloatingButton />
    </BrowserRouter>
  );
}

export default App;
