from app.api.schemas.municipalities import MunicipalityOut
from app.db.repositories.municipalities_repository import MunicipalitiesRepository


class MunicipalitiesService:
    def __init__(self, municipalities_repository: MunicipalitiesRepository):
        self._municipalities_repository = municipalities_repository

    async def list_municipalities(self) -> list[MunicipalityOut]:
        rows = await self._municipalities_repository.list_all()
        return [MunicipalityOut(**row) for row in rows]
