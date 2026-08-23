import HeatMapView from './components/HeatMapView';

function App() {
  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Protótipo de visualização</p>
          <h1>Mapa de calor de criminalidade por município brasileiro</h1>
          <p>
            Versão inicial com foco no Brasil para demonstrar a ideia de concentração
            de ocorrências em municípios selecionados.
          </p>
        </div>
      </header>

      <section className="panel">
        <div className="panel-info">
          <h2>O que o protótipo mostra</h2>
          <ul>
            <li>Foco geográfico no território brasileiro</li>
            <li>Camada de calor representando intensidade por município</li>
            <li>Base pronta para receber dados reais do backend</li>
          </ul>
        </div>
        <div className="map-card">
          <HeatMapView />
        </div>
      </section>
    </div>
  );
}

export default App;
