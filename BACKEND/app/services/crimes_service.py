from datetime import datetime

from app.api.schemas.crimes import (
    CrimeStatisticsOut,
    CrimeTypeCount,
    CrimeTypeOut,
    LocationCount,
    MonthlyCount,
    SeverityOut,
)
from app.db.repositories.crimes_repository import CrimesRepository
from app.db.repositories.municipalities_repository import MunicipalitiesRepository


class CrimesService:
    def __init__(
        self,
        crimes_repository: CrimesRepository,
        municipalities_repository: MunicipalitiesRepository,
    ):
        self._crimes_repository = crimes_repository
        self._municipalities_repository = municipalities_repository

    async def list_crime_types(self) -> list[CrimeTypeOut]:
        crime_types = await self._crimes_repository.list_crime_types()
        return [CrimeTypeOut(crime_type=crime_type) for crime_type in crime_types]

    async def list_severities(self) -> list[SeverityOut]:
        severities = await self._crimes_repository.list_severities()
        return [SeverityOut(severity=severity) for severity in severities]

    async def get_statistics(
        self,
        crime_types: list[str] | None,
        ibge_ids: list[int] | None,
        neighborhood_ids: list[int] | None,
        severities: list[str] | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> CrimeStatisticsOut:
        if start_date is not None and end_date is not None and start_date > end_date:
            raise ValueError("start_date must not be after end_date")

        if ibge_ids:
            existing = await self._municipalities_repository.filter_existing(ibge_ids)
            missing = sorted(set(ibge_ids) - existing)
            if missing:
                raise LookupError(f"Municípios não encontrados: {missing}")

        total = await self._crimes_repository.count_total(
            crime_types, ibge_ids, neighborhood_ids, severities, start_date, end_date
        )
        by_crime_type = await self._crimes_repository.count_by_crime_type(
            crime_types, ibge_ids, neighborhood_ids, severities, start_date, end_date
        )
        by_month = await self._crimes_repository.count_by_month(
            crime_types, ibge_ids, neighborhood_ids, severities, start_date, end_date
        )

        if neighborhood_ids:
            by_location_rows: list[dict] = []
        elif ibge_ids and len(ibge_ids) == 1:
            by_location_rows = await self._crimes_repository.count_by_neighborhood(
                ibge_ids, crime_types, severities, start_date, end_date
            )
        else:
            by_location_rows = await self._crimes_repository.count_by_municipality(
                crime_types, ibge_ids, severities, start_date, end_date
            )

        by_location = [self._enrich_location(row, total) for row in by_location_rows]

        return CrimeStatisticsOut(
            total=total,
            by_crime_type=[CrimeTypeCount(**row) for row in by_crime_type],
            by_month=[MonthlyCount(**row) for row in by_month],
            by_location=by_location,
        )

    @staticmethod
    def _enrich_location(row: dict, total: int) -> LocationCount:
        row_total = row["total"]
        homicide_total = int(row.get("homicide_total") or 0)
        population = row.get("population")
        percentage = round((row_total / total * 100), 2) if total else 0.0
        homicide_rate = round((homicide_total / population) * 100_000, 2) if population else None
        return LocationCount(
            id=row["id"],
            name=row["name"],
            total=row_total,
            homicide_total=homicide_total,
            percentage=percentage,
            homicide_rate_per_100k=homicide_rate,
        )



