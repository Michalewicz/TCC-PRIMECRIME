from app.api.schemas.neighborhoods import NeighborhoodOut
from app.db.repositories.municipalities_repository import MunicipalitiesRepository
from app.db.repositories.neighborhoods_repository import NeighborhoodsRepository


class NeighborhoodsService:
    def __init__(
        self,
        neighborhoods_repository: NeighborhoodsRepository,
        municipalities_repository: MunicipalitiesRepository,
    ):
        self._neighborhoods_repository = neighborhoods_repository
        self._municipalities_repository = municipalities_repository

    async def list_by_municipality(self, ibge_id: int) -> list[NeighborhoodOut]:
        if not await self._municipalities_repository.exists(ibge_id):
            raise LookupError(f"Municipality {ibge_id} not found")
        rows = await self._neighborhoods_repository.list_by_municipality(ibge_id)
        return [NeighborhoodOut(**row) for row in rows]
