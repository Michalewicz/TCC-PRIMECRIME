function DetailsPage() {
  return (
    <>
      <section className="about-section details-about">
        <h2>SOBRE O PROJETO</h2>
        <p>Espaço reservado para apresentar o projeto PrimeCrimes, seus objetivos e o contexto da análise criminal na Baixada Santista.</p>
      </section>
      <section className="details-page" aria-label="Detalhes do projeto">
        <article className="details-card">
          <h2>METODOLOGIA</h2>
          <p>Espaço reservado para descrever os critérios de organização, tratamento e análise dos dados.</p>
        </article>
        <article className="details-card">
          <h2>FONTES DE DADOS</h2>
          <p>Espaço reservado para identificar as fontes, períodos de referência e atualizações dos dados.</p>
        </article>
        <article className="details-card">
          <h2>COBERTURA GEOGRÁFICA</h2>
          <p>Espaço reservado para detalhar os municípios e bairros representados nas visualizações.</p>
        </article>
        <article className="details-card">
          <h2>LIMITAÇÕES</h2>
          <p>Espaço reservado para informar limitações, critérios de interpretação e possíveis lacunas dos dados.</p>
        </article>
      </section>
    </>
  );
}

export default DetailsPage;
