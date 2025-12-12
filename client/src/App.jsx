// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import UpdatePassword from './pages/UpdatePassword'

// inicializa cedo (opcional mas recomendado)
import { initSupabase } from './supabaseClient'
initSupabase()

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/update-password" element={<UpdatePassword />} />
      </Routes>
    </BrowserRouter>
  )
}
