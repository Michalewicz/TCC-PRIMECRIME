import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import DetailsPage from '../pages/Details/DetailsPage';
import MapPage from '../pages/Map/MapPage';
import { ROUTES } from './routes';

function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path={ROUTES.home} element={<Navigate to={ROUTES.map} replace />} />
        <Route path={ROUTES.map} element={<MapPage />} />
        <Route path={ROUTES.charts} element={<DashboardPage />} />
        <Route path={ROUTES.details} element={<DetailsPage />} />
        <Route path="*" element={<Navigate to={ROUTES.map} replace />} />
      </Route>
    </Routes>
  );
}

export default AppRouter;
