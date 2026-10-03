import { FiltersProvider } from './contexts/FiltersContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AppRouter from './router/AppRouter';

function App() {
  return (
    <ThemeProvider>
      <FiltersProvider>
        <AppRouter />
      </FiltersProvider>
    </ThemeProvider>
  );
}

export default App;
