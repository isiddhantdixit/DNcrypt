import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { EncodePage } from './pages/EncodePage';
import { ExplorerPage } from './pages/ExplorerPage';
import { MutationLabPage } from './pages/MutationLabPage';
import { RecoveryPage } from './pages/RecoveryPage';
import { BenchmarkPage } from './pages/BenchmarkPage';
import { AboutPage } from './pages/AboutPage';
import { SimulationPage } from './pages/SimulationPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="simulations" element={<SimulationPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="encode" element={<EncodePage />} />
          <Route path="explorer" element={<ExplorerPage />} />
          <Route path="mutation-lab" element={<MutationLabPage />} />
          <Route path="recovery" element={<RecoveryPage />} />
          <Route path="benchmarks" element={<BenchmarkPage />} />
          <Route path="about" element={<AboutPage />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
