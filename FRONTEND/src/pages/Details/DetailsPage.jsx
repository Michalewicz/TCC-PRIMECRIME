function DetailsPage() {
  return (
    <>
      <section className="about-section details-about">
        <h2>Sobre o projeto</h2>
        <p>
          O PrimeCrime é uma plataforma web desenvolvida para facilitar a consulta e a visualização de dados relacionados à criminalidade na Baixada Santista. Por meio de mapas interativos e gráficos estatísticos, o sistema permite explorar registros de ocorrências criminais considerando diferentes localidades, períodos e categorias. A proposta é transformar dados públicos em informações visuais mais acessíveis, contribuindo para a compreensão da distribuição geográfica e temporal das ocorrências.
        </p>
      </section>
      <section className="details-page" aria-label="Detalhes do projeto">
        <article className="details-card">
          <h2>Objetivo da plataforma</h2>
          <p>
            O principal objetivo do PrimeCrime é oferecer uma ferramenta de consulta que permita compreender melhor a distribuição das ocorrências criminais nos municípios contemplados da Baixada Santista. A plataforma busca simplificar a exploração dos dados, permitindo que cidadãos, estudantes, pesquisadores e demais interessados identifiquem padrões, comparem localidades e acompanhem variações ao longo do tempo, sem precisar manipular diretamente grandes planilhas ou utilizar ferramentas especializadas.
          </p>
        </article>
        <article className="details-card">
          <h2>Desenvolvimento e autoria</h2>
          <p>
            O PrimeCrime foi desenvolvido por Rafael Michalewicz Rodrigues e Sandro Gabriel dos Santos de Jesus como Trabalho de Conclusão de Curso do curso superior de Tecnologia em Análise e Desenvolvimento de Sistemas da Faculdade de Tecnologia da Praia Grande (Fatec Praia Grande). O projeto reúne conhecimentos de desenvolvimento web, programação, modelagem de banco de dados, tratamento de informações e visualização geográfica, aplicados à criação de uma ferramenta voltada à consulta de dados públicos.
          </p>
        </article>
        <article className="details-card">
          <h2>Arquitetura do sistema</h2>
          <p>
            A aplicação utiliza uma arquitetura cliente-servidor, dividida em três componentes principais: frontend, backend e banco de dados. O frontend é responsável pela interface apresentada ao usuário e pelas visualizações; o backend recebe as solicitações, processa os filtros e realiza as consultas; enquanto o banco de dados armazena os registros utilizados pela plataforma. Essa separação permite organizar as responsabilidades do sistema e manter a comunicação entre seus componentes por meio de requisições HTTP e respostas em formato JSON.
          </p>
        </article>
        <article className="details-card">
          <h2>Tecnologias utilizadas</h2>
          <p>
            O desenvolvimento do PrimeCrime utiliza diferentes tecnologias integradas. O backend foi implementado em Python, com o framework FastAPI, enquanto a interface foi construída com React, utilizando o ecossistema JavaScript e a ferramenta Vite. Para o armazenamento e gerenciamento dos dados, foi utilizado o MySQL. A integração dessas tecnologias permite combinar processamento de informações, persistência de dados e apresentação de conteúdo em uma aplicação web interativa.
          </p>
        </article>
        <article className="details-card">
          <h2>Banco de dados</h2>
          <p>
            O sistema utiliza o MySQL como sistema gerenciador de banco de dados relacional. Sua estrutura foi projetada para organizar informações geográficas e registros de ocorrências criminais, relacionando entidades como regiões, estados, municípios, bairros e ocorrências. Essa organização permite realizar consultas por localização, período, tipo e classificação da ocorrência, mantendo os dados estruturados para utilização nas diferentes áreas da plataforma.
          </p>
        </article>
        <article className="details-card">
          <h2>Mapas e visualização geográfica</h2>
          <p>
            A representação geográfica das ocorrências é realizada com a biblioteca Leaflet, integrada à interface React. O sistema utiliza polígonos territoriais para representar municípios e bairros disponíveis, além de uma camada de intensidade baseada no plugin Leaflet.heat. A escala de cores permite identificar visualmente as áreas com maior ou menor concentração de registros, enquanto os filtros possibilitam modificar as informações exibidas conforme os critérios selecionados pelo usuário.
          </p>
        </article>
        <article className="details-card">
          <h2>Gráficos e estatísticas</h2>
          <p>
            A plataforma utiliza a biblioteca Chart.js para apresentar os dados por meio de diferentes representações gráficas, incluindo gráficos de rosca, barras e séries mensais. Essas visualizações permitem comparar categorias de ocorrências, observar variações ao longo do tempo e analisar diferenças entre localidades. Também é disponibilizada a taxa de homicídios por 100 mil habitantes quando existem dados populacionais necessários para o cálculo.
          </p>
        </article>
        <article className="details-card">
          <h2>Fontes de dados</h2>
          <p>
            As informações utilizadas pelo PrimeCrime são provenientes de fontes públicas oficiais. Os registros de ocorrências criminais são obtidos por meio das estatísticas disponibilizadas pela Secretaria da Segurança Pública do Estado de São Paulo (SSP-SP), enquanto os dados cartográficos utilizados na representação territorial são provenientes do Instituto Brasileiro de Geografia e Estatística (IBGE). A integração dessas fontes permite relacionar os registros criminais às respectivas localidades.
          </p>
        </article>
        <article className="details-card">
          <h2>Tratamento e organização dos dados</h2>
          <p>
            Antes de serem disponibilizados na plataforma, os dados passam por um processo de extração, transformação e carga (ETL), desenvolvido em Python. Essa etapa envolve a leitura das planilhas de origem, a normalização de informações textuais, a organização dos períodos, a associação dos bairros aos identificadores territoriais e a classificação da gravidade das ocorrências. Após o tratamento, os registros são organizados e inseridos no banco de dados MySQL para utilização nas consultas do sistema.
          </p>
        </article>
        <article className="details-card">
          <h2>Filtros e consultas interativas</h2>
          <p>
            O PrimeCrime permite combinar diferentes critérios para explorar os registros disponíveis. Entre as opções estão o tipo e a classificação da ocorrência, o intervalo de datas, o município e o bairro. As seleções realizadas pelo usuário são compartilhadas entre as páginas da aplicação, permitindo que o mapa e os gráficos apresentem informações correspondentes aos mesmos critérios de consulta.
          </p>
        </article>
        <article className="details-card">
          <h2>Abrangência geográfica e limitações</h2>
          <p>
            O projeto tem como foco os municípios contemplados da Baixada Santista, utilizando informações criminais e bases cartográficas disponíveis para a região. A visualização por bairro depende da existência dos arquivos territoriais correspondentes. Por esse motivo, Peruíbe não possui detalhamento geográfico por bairro na aplicação, devido à ausência do arquivo shapefile correspondente na fonte cartográfica consultada do IBGE. Os dados apresentados também estão limitados ao período abrangido pela base utilizada no desenvolvimento.
          </p>
        </article>
        <article className="details-card">
          <h2>Finalidade e responsabilidade das informações</h2>
          <p>
            O PrimeCrime foi desenvolvido como uma ferramenta de consulta e exploração visual de dados públicos, com finalidade informativa e acadêmica. As representações disponibilizadas permitem observar distribuições e padrões presentes nos registros, mas não substituem estatísticas oficiais, investigações policiais ou análises especializadas. Os resultados devem ser interpretados considerando as características, a abrangência e as limitações das fontes de dados utilizadas.
          </p>
        </article>
      </section>
    </>
  );
}

export default DetailsPage;
