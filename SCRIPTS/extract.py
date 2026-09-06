import csv
import sys
import unicodedata
from datetime import datetime
from datetime import time as dt_time
from pathlib import Path

import openpyxl
from tqdm import tqdm

colunas_mapping = {
    "DATA_OCORRENCIA_BO": "reference_datetime",
    "HORA_OCORRENCIA_BO": "reference_datetime",
    "DESC_PERIODO": "descrição período", # CONVERTER OCORRÊNCIAS DE "DESCRIÇÃO PERÍODO" PARA HORAS DO DATETIME
    "BAIRRO": "bairro", # CONVERTER NOME DE BAIRRO PARA ID DE BAIRRO
    "NATUREZA_APURADA": "crime_type",
    "CD_IBGE": "ibge_id",
}

nomes_municipios_mapping = {
    "S.VICENTE": "SÃO VICENTE",
    "ITANHAEM": "ITANHAÉM",
    "MONGAGUA": "MONGAGUÁ",
    "PRAIA GRANDE": "PRAIA GRANDE",
    "CUBATAO": "CUBATÃO",
    "BERTIOGA": "BERTIOGA",
    "SANTOS": "SANTOS",
    "GUARUJA": "GUARUJÁ",
}

estados_brasil = {
    "Acre": "AC",
    "Alagoas": "AL",
    "Amapá": "AP",
    "Amazonas": "AM",
    "Bahia": "BA",
    "Ceará": "CE",
    "Distrito Federal": "DF",
    "Espírito Santo": "ES",
    "Goiás": "GO",
    "Maranhão": "MA",
    "Mato Grosso": "MT",
    "Mato Grosso do Sul": "MS",
    "Minas Gerais": "MG",
    "Pará": "PA",
    "Paraíba": "PB",
    "Paraná": "PR",
    "Pernambuco": "PE",
    "Piauí": "PI",
    "Rio de Janeiro": "RJ",
    "Rio Grande do Norte": "RN",
    "Rio Grande do Sul": "RS",
    "Rondônia": "RO",
    "Roraima": "RR",
    "Santa Catarina": "SC",
    "São Paulo": "SP",
    "Sergipe": "SE",
    "Tocantins": "TO",
}


# Municípios da Baixada Santista que interessam para a extração
MUNICIPIOS_INTERESSE = [
    "BERTIOGA", "PRAIA GRANDE", "CUBATÃO", "SANTOS",
    "SÃO VICENTE", "MONGAGUÁ", "ITANHAÉM", "GUARUJÁ",
]

# Prefixos das abas de dados criminais que interessam (o ano varia por planilha, ex.: JAN-JUN_2022)
ABAS_DE_INTERESSE_PREFIXOS = ("JAN-JUN", "JUL-DEZ")

# Hora estimada de referência para ocorrências sem HORA_OCORRENCIA_BO, por período descrito
PERIODO_HORA_MAPPING = {
    "DE MADRUGADA": 3,
    "PELA MANHA": 9,
    "A TARDE": 15,
    "A NOITE": 21,
    "EM HORA INCERTA": 12,
}

# De/para de NATUREZA_APURADA (normalizada) -> gravidade do crime.
# Chaves geradas a partir da lista de valores distintos observada nas planilhas (2022-2026).
SEVERITY_MAPPING = {
    "HOMICIDIO DOLOSO": "MORTE",
    "HOMICIDIO DOLOSO POR ACIDENTE DE TRANSITO": "MORTE",
    "HOMICIDIO CULPOSO OUTROS": "MORTE",
    "HOMICIDIO CULPOSO POR ACIDENTE DE TRANSITO": "MORTE",
    "LATROCINIO": "MORTE",
    "LESAO CORPORAL SEGUIDA DE MORTE": "MORTE",
    "ESTUPRO": "HEDIONDO",
    "ESTUPRO DE VULNERAVEL": "HEDIONDO",
    "EXTORSAO MEDIANTE SEQUESTRO": "HEDIONDO",
    "TENTATIVA DE HOMICIDIO": "HEDIONDO",
    "ROUBO - OUTROS": "ROUBO",
    "ROUBO A BANCO": "ROUBO",
    "ROUBO DE CARGA": "ROUBO",
    "ROUBO DE VEICULO": "ROUBO",
    "FURTO - OUTROS": "FURTO",
    "FURTO DE CARGA": "FURTO",
    "FURTO DE VEICULO": "FURTO",
    "LESAO CORPORAL DOLOSA": "LESAO CORPORAL",
    "LESAO CORPORAL CULPOSA - OUTRAS": "LESAO CORPORAL",
    "LESAO CORPORAL CULPOSA POR ACIDENTE DE TRANSITO": "LESAO CORPORAL",
    "PORTE DE ARMA": "PORTE ARMA",
    "PORTE DE ENTORPECENTES": "ENTORPECENTES",
    "APREENSAO DE ENTORPECENTES": "ENTORPECENTES",
    "TRAFICO DE ENTORPECENTES": "ENTORPECENTES",
}
SEVERITY_FALLBACK = "OUTROS"  # gravidade padrão para NATUREZA_APURADA fora do de/para acima


def escape(value: str) -> str:
    return value.replace("'", "''")


# Alguns nomes de coluna mudam de planilha para planilha (ex.: DESC_PERIODO vs DESCR_PERIODO)
def resolve_column(idx: dict[str, int], *candidates: str) -> int:
    for name in candidates:
        if name in idx:
            return idx[name]
    raise KeyError(f"Nenhuma das colunas {candidates} encontrada. Colunas disponíveis: {list(idx)}")


def normalize_text(value) -> str:
    text = str(value) if value is not None else ""
    text = text.replace("\u2013", "-").replace("\u2014", "-")  # en/em dash -> hífen comum
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    return " ".join(text.upper().split())


def resolve_severity(crime_type: str) -> str:
    return SEVERITY_MAPPING.get(normalize_text(crime_type), SEVERITY_FALLBACK)


# Planilha mistura células de data/hora reais com texto; normaliza ambos os casos
def parse_date(value):
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, str):
        for fmt in ("%Y-%m-%d", "%d/%m/%Y"):
            try:
                return datetime.strptime(value.strip(), fmt).date()
            except ValueError:
                continue
    return None


def parse_time(value):
    if isinstance(value, dt_time):
        return value
    if isinstance(value, str):
        value = value.strip()
        if value and value.upper() != "NULL":
            for fmt in ("%H:%M:%S", "%H:%M"):
                try:
                    return datetime.strptime(value, fmt).time()
                except ValueError:
                    continue
    return None


def municipios_extractor(
    csv_path: str,
    output_path: str,
    censo_csv_path: str = "br_ibge_censo_2022_municipio.csv",
) -> None:
    rows: list[dict] = []
    with open(csv_path, encoding="utf-8", newline="") as f:
        rows = list(csv.DictReader(f))

    if not rows:
        print("CSV is empty.", file=sys.stderr)
        sys.exit(1)

    # Censo IBGE 2022 (ETL): população por município, chaveada pelo código IBGE
    population_by_ibge: dict[str, int] = {}
    with open(censo_csv_path, encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            population_by_ibge[row["id_municipio"]] = int(row["populacao"])

    # Deduplicate regions, keyed by the IBGE code itself (CD_REGIAO)
    region_id: dict[str, int] = {}
    regions: list[tuple[int, str]] = []  # (region_id, NM_REGIAO)
    for row in rows:
        code = row["CD_REGIAO"]
        if code not in region_id:
            region_id[code] = int(code)
            regions.append((region_id[code], row["NM_REGIAO"]))

    # Deduplicate states, keyed by the IBGE code itself (CD_UF)
    state_id: dict[str, int] = {}
    states: list[tuple[int, str, int, str]] = []  # (uf_id, NM_UF, region_id)
    for row in rows:
        code = row["CD_UF"]
        if code not in state_id:
            state_id[code] = int(code)
            states.append((state_id[code], row["NM_UF"], region_id[row["CD_REGIAO"]], estados_brasil[row["NM_UF"]]))

    lines: list[str] = ["-- Auto-generated seed data", ""]

    lines.append("-- regions")
    for rid, name in regions:
        lines.append(
            f"INSERT INTO `regions` (`region_id`, `region_name`) VALUES ({rid}, '{escape(name)}');"
        )

    lines.append("")
    lines.append("-- states")
    for uid, uf_name, rid, acronym in states:
        lines.append(
            f"INSERT INTO `states` (`uf_id`, `uf_name`, `region_id`, `acronym`) VALUES ({uid}, '{escape(uf_name)}', {rid}, '{acronym}');"
        )

    lines.append("")
    lines.append("-- municipalities")
    missing_population = 0
    for row in rows:
        ibge = row["CD_MUN"]
        name = escape(row["NM_MUN"])
        area = row["AREA_KM2"].replace(",", ".")
        uid = state_id[row["CD_UF"]]
        if row["NM_MUN"].upper() in MUNICIPIOS_INTERESSE and state_id[row["CD_UF"]] == 35:
            population = population_by_ibge.get(ibge)
            if population is None:
                missing_population += 1
                population = 0
            lines.append(
                f"INSERT INTO `municipalities` (`ibge_id`, `municipality_name`, `area_km2`, `population`, `uf_id`) "
                f"VALUES ({ibge}, '{name}', {area}, {population}, {uid});"
            )

    Path(output_path).write_text("\n".join(lines), encoding="utf-8")
    print(
        f"Done: {len(regions)} regions, {len(states)} states, {len(rows)} municipalities "
        f"({missing_population} sem população no censo) -> {output_path}"
    )


def neighborhood_extractor(csv_path: str, output_path: str) -> None:
    rows: list[dict] = []
    with open(csv_path, encoding="utf-8", newline="") as f:
        rows = list(csv.DictReader(f))

    if not rows:
        print("CSV is empty.", file=sys.stderr)
        sys.exit(1)

    lines: list[str] = ["-- Auto-generated seed data", ""]

    lines.append("-- neighborhoods")
    neighborhood_id: dict[str, int] = {}
    for row in rows:
        ibge = row["CD_BAIRRO"]
        name = escape(row["NM_BAIRRO"])
        municipality_ibge = row["CD_MUN"]

        # IF para deduplicar registros
        if ibge in neighborhood_id:
            continue
        neighborhood_id[ibge] = int(ibge)
        lines.append(
            f"INSERT INTO `neighborhoods` (`id`, `neighborhood_name`, `ibge_id`) "
            f"VALUES ({neighborhood_id[ibge]}, '{name}', {municipality_ibge});"
        )

    Path(output_path).write_text("\n".join(lines), encoding="utf-8")
    print(
        f"Done: {len(rows)} neighborhoods -> {output_path}"
    )

def crimes_extractor(
    xlsx_path: str,
    output_path: str,
    municipios_csv_path: str = "municipios.csv",
    bairros_csv_path: str = "baixada_santista_bairros.csv",
) -> None:
    # CD_IBGE é a fonte confiável de município; NOME_MUNICIPIO na planilha tem erros de digitação
    target_ibge_ids: set[int] = set()
    with open(municipios_csv_path, encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            if row["NM_MUN"].upper() in MUNICIPIOS_INTERESSE and int(row["CD_UF"]) == 35:
                target_ibge_ids.add(int(row["CD_MUN"]))

    # (ibge_id, nome do bairro normalizado) -> id do bairro, usado para resolver `neighborhood_id`
    neighborhood_lookup: dict[tuple[int, str], int] = {}
    with open(bairros_csv_path, encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            key = (int(row["CD_MUN"]), normalize_text(row["NM_BAIRRO"]))
            neighborhood_lookup[key] = int(row["CD_BAIRRO"])

    # Bairro placeholder por município, usado quando o BAIRRO da ocorrência não é reconhecido
    placeholder_neighborhood_id = {ibge: ibge * 1000 + 999 for ibge in target_ibge_ids}

    wb = openpyxl.load_workbook(xlsx_path, read_only=True)

    # O ano no nome da aba varia por planilha (ex.: JAN-JUN_2022, JUL-DEZ_2023), então filtramos pelo prefixo
    sheet_names = [name for name in wb.sheetnames if name.upper().startswith(ABAS_DE_INTERESSE_PREFIXOS)]

    lines: list[str] = ["-- Auto-generated seed data", "", "-- neighborhoods (sem bairro definido)"]
    for ibge, neighborhood_id in sorted(placeholder_neighborhood_id.items()):
        lines.append(
            f"INSERT INTO `neighborhoods` (`id`, `neighborhood_name`, `ibge_id`) "
            f"VALUES ({neighborhood_id}, 'SEM BAIRRO DEFINIDO', {ibge});"
        )

    lines.append("")
    lines.append("-- crimes")
    total_rows = 0
    inserted = 0
    sem_bairro = 0
    skipped_no_data = 0
    value_tuples: list[str] = []

    for sheet_name in sheet_names:
        ws = wb[sheet_name]
        idx: dict[str, int] = {}
        rows_iter = tqdm(
            ws.iter_rows(values_only=True),
            total=ws.max_row,
            desc=f"{Path(xlsx_path).name}::{sheet_name}",
            unit="linhas",
        )
        for i, row in enumerate(rows_iter):
            if i == 0:
                idx = {name: pos for pos, name in enumerate(row)}
                continue

            total_rows += 1
            ibge_id = row[resolve_column(idx, "CD_IBGE", "COD IBGE")]
            if ibge_id not in target_ibge_ids:
                continue

            bairro_nome = normalize_text(row[idx["BAIRRO"]])
            neighborhood_id = neighborhood_lookup.get((ibge_id, bairro_nome))
            if neighborhood_id is None:
                neighborhood_id = placeholder_neighborhood_id[ibge_id]
                sem_bairro += 1

            data_ocorrencia = parse_date(row[idx["DATA_OCORRENCIA_BO"]])
            if data_ocorrencia is None:
                skipped_no_data += 1
                continue

            hora_ocorrencia = parse_time(row[idx["HORA_OCORRENCIA_BO"]])
            if hora_ocorrencia is not None:
                reference_datetime = datetime.combine(data_ocorrencia, hora_ocorrencia)
            else:
                periodo = normalize_text(row[resolve_column(idx, "DESC_PERIODO", "DESCR_PERIODO")])
                hora_estimada = PERIODO_HORA_MAPPING.get(periodo, 12)
                reference_datetime = datetime.combine(data_ocorrencia, dt_time(hour=hora_estimada))

            crime_type = escape(str(row[idx["NATUREZA_APURADA"]] or ""))
            severity = resolve_severity(row[idx["NATUREZA_APURADA"]])

            value_tuples.append(
                f"({ibge_id}, '{reference_datetime:%Y-%m-%d %H:%M:%S}', '{crime_type}', '{severity}', {neighborhood_id})"
            )
            inserted += 1

    if value_tuples:
        lines.append("INSERT INTO `crimes` (`ibge_id`, `reference_datetime`, `crime_type`, `severity`, `neighborhood_id`) VALUES")
        lines.append(",\n".join(value_tuples) + ";")

    Path(output_path).write_text("\n".join(lines), encoding="utf-8")
    print(
        f"Done: {inserted} crimes inserted ({sem_bairro} sem bairro identificado), "
        f"{skipped_no_data} skipped (data inválida), {total_rows} rows scanned -> {output_path}"
    )


if __name__ == "__main__":
    # municipios_extractor("municipios.csv", "sql script.sql")
    # neighborhood_extractor("baixada_santista_bairros.csv", "sql script bairros.sql")
    crimes_extractor("SPDadosCriminais_2022.xlsx", "sql script crimes 2022.sql")
    crimes_extractor("SPDadosCriminais_2023.xlsx", "sql script crimes 2023.sql")
    crimes_extractor("SPDadosCriminais_2024.xlsx", "sql script crimes 2024.sql")
    crimes_extractor("SPDadosCriminais_2025.xlsx", "sql script crimes 2025.sql")
    crimes_extractor("SPDadosCriminais_2026.xlsx", "sql script crimes 2026.sql")
