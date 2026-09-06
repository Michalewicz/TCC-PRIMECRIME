from pydantic import BaseModel, ConfigDict


class CrimeTypeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    crime_type: str


class CrimeTypeCount(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    crime_type: str
    total: int


class SeverityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    severity: str


class MonthlyCount(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    month: str
    total: int


class LocationCount(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    total: int
    homicide_total: int
    percentage: float
    homicide_rate_per_100k: float | None = None


class CrimeStatisticsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total: int
    by_crime_type: list[CrimeTypeCount]
    by_month: list[MonthlyCount]
    by_location: list[LocationCount]
