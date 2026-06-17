import { Routes, Route, Navigate } from 'react-router-dom';
import { CargarEstructuraOrganizacionalPage } from '@/pages/cargar-estructura-organizacional';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/estructura-organizacional/cargar" replace />} />
      <Route path="/estructura-organizacional/cargar" element={<CargarEstructuraOrganizacionalPage />} />
    </Routes>
  );
}
