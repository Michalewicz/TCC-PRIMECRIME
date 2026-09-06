from pydantic import BaseModel, ConfigDict


class NeighborhoodOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ibge_id: int
    neighborhood_name: str
