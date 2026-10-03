function ChartCard({ className = '', title, empty, children }) {
  return (
    <div className={`chart-card ${className}`.trim()}>
      <h3>{title}</h3>
      <div className="chart-canvas">
        {empty ? <p className="chart-empty">Sem dados para os filtros selecionados</p> : children}
      </div>
    </div>
  );
}

export default ChartCard;
