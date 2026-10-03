import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../contexts/ThemeContext';

/** App shell: sidebar + the routed page + footer. */
function MainLayout() {
  const { isDark } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={`app-shell ${isDark ? 'dark-theme' : 'light-theme'} ${sidebarCollapsed ? 'sidebar-is-collapsed' : ''}`}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((current) => !current)}
      />

      <main className="app-content">
        <Outlet />
        <footer className="site-footer">PrimeCrimes criado por Rafael Michalewicz e Sandro Gabriel</footer>
      </main>
    </div>
  );
}

export default MainLayout;
