from pydantic import BaseModel, ConfigDict


class MunicipalityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    ibge_id: int
    municipality_name: str
    area_km2: float
    population: int
    uf_id: int
