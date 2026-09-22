import { BarChart3, MapPinned, Moon, Sun } from 'lucide-react';

function Sidebar({ activePage, onPageChange, isDark, onToggleTheme }) {
  return (
    <aside className="sidebar" aria-label="Navegacao principal">
      <div className="sidebar-brand">
        <img className="brand-logo" src={isDark ? '/logo-light.png' : '/logo-dark.png'} alt="PrimeCrimes" />
        <span className="brand-mark-ring" />
      </div>
      <h2 className="sidebar-title">PrimeCrimes</h2>

      <button
        type="button"
        className="theme-switcher"
        onClick={onToggleTheme}
        aria-label={`Ativar modo ${isDark ? 'claro' : 'escuro'}`}
        aria-pressed={!isDark}
      >
        <span className="theme-switch-track" aria-hidden="true">
          <span className={`theme-switch-thumb ${isDark ? 'is-dark' : 'is-light'}`}>
            {isDark ? <Moon size={13} strokeWidth={2.4} /> : <Sun size={13} strokeWidth={2.4} />}
          </span>
        </span>
      </button>

      <nav className="sidebar-nav" aria-label="Paginas">
        <button
          type="button"
          className={`sidebar-link ${activePage === 'map' ? 'is-active' : ''}`}
          onClick={() => onPageChange('map')}
          aria-current={activePage === 'map' ? 'page' : undefined}
        >
          <span className="sidebar-link-icon" aria-hidden="true"><MapPinned size={17} strokeWidth={2.2} /></span>
          <span>Mapa de Calor</span>
        </button>
        <button
          type="button"
          className={`sidebar-link ${activePage === 'charts' ? 'is-active' : ''}`}
          onClick={() => onPageChange('charts')}
          aria-current={activePage === 'charts' ? 'page' : undefined}
        >
          <span className="sidebar-link-icon" aria-hidden="true"><BarChart3 size={17} strokeWidth={2.2} /></span>
          <span>Graficos</span>
        </button>
      </nav>

    </aside>
  );
}

export default Sidebar;
