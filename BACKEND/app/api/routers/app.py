from datetime import datetime

import aiomysql
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.schemas.crimes import CrimeStatisticsOut, CrimeTypeOut, SeverityOut
from app.api.schemas.municipalities import MunicipalityOut
from app.api.schemas.neighborhoods import NeighborhoodOut
from app.db.database import get_db_pool
from app.db.repositories.crimes_repository import CrimesRepository
from app.db.repositories.municipalities_repository import MunicipalitiesRepository
from app.db.repositories.neighborhoods_repository import NeighborhoodsRepository
from app.services.crimes_service import CrimesService
from app.services.municipalities_service import MunicipalitiesService
from app.services.neighborhoods_service import NeighborhoodsService

router = APIRouter(prefix="/api", tags=["filters"])


async def get_crimes_service(pool: aiomysql.Pool = Depends(get_db_pool)) -> CrimesService:
    return CrimesService(CrimesRepository(pool), MunicipalitiesRepository(pool))


async def get_municipalities_service(pool: aiomysql.Pool = Depends(get_db_pool)) -> MunicipalitiesService:
    return MunicipalitiesService(MunicipalitiesRepository(pool))


async def get_neighborhoods_service(pool: aiomysql.Pool = Depends(get_db_pool)) -> NeighborhoodsService:
    return NeighborhoodsService(
        NeighborhoodsRepository(pool),
        MunicipalitiesRepository(pool),
    )


@router.get("/crime-types", response_model=list[CrimeTypeOut])
async def list_crime_types(
    service: CrimesService = Depends(get_crimes_service),
) -> list[CrimeTypeOut]:
    return await service.list_crime_types()


@router.get("/severities", response_model=list[SeverityOut])
async def list_severities(
    service: CrimesService = Depends(get_crimes_service),
) -> list[SeverityOut]:
    return await service.list_severities()


@router.get("/municipalities", response_model=list[MunicipalityOut])
async def list_municipalities(
    service: MunicipalitiesService = Depends(get_municipalities_service),
) -> list[MunicipalityOut]:
    return await service.list_municipalities()


@router.get("/municipalities/{ibge_id}/neighborhoods", response_model=list[NeighborhoodOut])
async def list_neighborhoods_by_municipality(
    ibge_id: int,
    service: NeighborhoodsService = Depends(get_neighborhoods_service),
) -> list[NeighborhoodOut]:
    try:
        return await service.list_by_municipality(ibge_id)
    except LookupError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Município não encontrado") from error


@router.get("/crimes/statistics", response_model=CrimeStatisticsOut)
async def get_crime_statistics(
    crime_type: list[str] | None = Query(None),
    ibge_id: list[int] | None = Query(None),
    neighborhood_id: list[int] | None = Query(None),
    severity: list[str] | None = Query(None),
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    service: CrimesService = Depends(get_crimes_service),
) -> CrimeStatisticsOut:
    try:
        return await service.get_statistics(
            crime_type, ibge_id, neighborhood_id, severity, start_date, end_date
        )
    except LookupError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)) from error
