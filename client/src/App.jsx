import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner"; // <--- Importação Nova
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      {/* O Toaster fica aqui, invisível, esperando comandos */}
      <Toaster position="top-right" richColors />

      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
