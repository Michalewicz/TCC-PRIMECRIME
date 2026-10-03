import { NavLink } from 'react-router-dom';
import { BarChart3, ChevronLeft, ClipboardList, MapPinned, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { ROUTES } from '../router/routes';

const NAV_ITEMS = [
  { to: ROUTES.map, label: 'Mapa de Calor', Icon: MapPinned },
  { to: ROUTES.charts, label: 'Gráficos', Icon: BarChart3 },
  { to: ROUTES.details, label: 'Detalhes', Icon: ClipboardList },
];

function Sidebar({ collapsed, onToggleCollapsed }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <aside id="app-sidebar" className={`sidebar ${collapsed ? 'is-collapsed' : ''}`} aria-label="Navegação principal">
      <button
        type="button"
        className={`sidebar-collapse-toggle ${collapsed ? 'is-collapsed' : ''}`}
        onClick={onToggleCollapsed}
        aria-label={collapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
        aria-expanded={!collapsed}
        aria-controls="app-sidebar"
      >
        <ChevronLeft size={18} strokeWidth={2.4} />
      </button>

      <div className="sidebar-brand">
        <img className="brand-logo" src={isDark ? '/logo-light.png' : '/logo-dark.png'} alt="PrimeCrimes" />
        <span className="brand-mark-ring" />
      </div>
      <h2 className="sidebar-title">PrimeCrimes</h2>

      <button
        type="button"
        className="theme-switcher"
        onClick={toggleTheme}
        aria-label={`Ativar modo ${isDark ? 'claro' : 'escuro'}`}
        aria-pressed={!isDark}
      >
        <span className="theme-switch-track" aria-hidden="true">
          <span className={`theme-switch-thumb ${isDark ? 'is-dark' : 'is-light'}`}>
            {isDark ? <Moon size={13} strokeWidth={2.4} /> : <Sun size={13} strokeWidth={2.4} />}
          </span>
        </span>
      </button>

      <nav className="sidebar-nav" aria-label="Páginas">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            title={collapsed ? label : undefined}
            className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
          >
            <span className="sidebar-link-icon" aria-hidden="true"><Icon size={17} strokeWidth={2.2} /></span>
            <span className="sidebar-link-label">{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
