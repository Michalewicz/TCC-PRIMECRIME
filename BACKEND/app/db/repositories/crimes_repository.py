from datetime import datetime

import aiomysql


class CrimesRepository:
    # Intentional-death crime types counted towards the homicide rate (excludes culposo/negligent deaths).
    _HOMICIDE_TYPES = (
        "HOMICÍDIO DOLOSO",
        "HOMICÍDIO DOLOSO POR ACIDENTE DE TRÂNSITO",
        "LATROCÍNIO",
        "LESÃO CORPORAL SEGUIDA DE MORTE",
    )
    _HOMICIDE_TYPES_PLACEHOLDERS = ", ".join(["%s"] * len(_HOMICIDE_TYPES))

    def __init__(self, pool: aiomysql.Pool):
        self._pool = pool

    async def list_crime_types(self) -> list[str]:
        query = "SELECT DISTINCT crime_type FROM crimes ORDER BY crime_type"
        async with self._pool.acquire() as connection:
            async with connection.cursor() as cursor:
                await cursor.execute(query)
                rows = await cursor.fetchall()
        return [row[0] for row in rows]

    async def list_severities(self) -> list[str]:
        query = "SELECT DISTINCT severity FROM crimes ORDER BY severity"
        async with self._pool.acquire() as connection:
            async with connection.cursor() as cursor:
                await cursor.execute(query)
                rows = await cursor.fetchall()
        return [row[0] for row in rows]

    async def count_total(
        self,
        crime_types: list[str] | None = None,
        ibge_ids: list[int] | None = None,
        neighborhood_ids: list[int] | None = None,
        severities: list[str] | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> int:
        where_sql, params = self._build_where(
            crime_types, ibge_ids, neighborhood_ids, severities, start_date, end_date
        )
        query = f"SELECT COUNT(*) AS total FROM crimes AS c {where_sql}"
        async with self._pool.acquire() as connection:
            async with connection.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(query, params)
                row = await cursor.fetchone()
        return row["total"] if row else 0

    async def count_by_crime_type(
        self,
        crime_types: list[str] | None = None,
        ibge_ids: list[int] | None = None,
        neighborhood_ids: list[int] | None = None,
        severities: list[str] | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> list[dict]:
        where_sql, params = self._build_where(
            crime_types, ibge_ids, neighborhood_ids, severities, start_date, end_date
        )
        query = (
            "SELECT c.crime_type AS crime_type, COUNT(*) AS total "
            f"FROM crimes AS c {where_sql} GROUP BY c.crime_type ORDER BY total DESC"
        )
        async with self._pool.acquire() as connection:
            async with connection.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(query, params)
                return await cursor.fetchall()

    async def count_by_month(
        self,
        crime_types: list[str] | None = None,
        ibge_ids: list[int] | None = None,
        neighborhood_ids: list[int] | None = None,
        severities: list[str] | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> list[dict]:
        where_sql, params = self._build_where(
            crime_types, ibge_ids, neighborhood_ids, severities, start_date, end_date
        )
        query = (
            "SELECT DATE_FORMAT(c.reference_datetime, '%%Y-%%m') AS month, COUNT(*) AS total "
            f"FROM crimes AS c {where_sql} GROUP BY month ORDER BY month"
        )
        async with self._pool.acquire() as connection:
            async with connection.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(query, params)
                return await cursor.fetchall()

    async def count_by_neighborhood(
        self,
        ibge_ids: list[int],
        crime_types: list[str] | None = None,
        severities: list[str] | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> list[dict]:
        where_sql, params = self._build_where(crime_types, ibge_ids, None, severities, start_date, end_date)
        query = (
            "SELECT n.id AS id, n.neighborhood_name AS name, COUNT(*) AS total, "
            f"SUM(CASE WHEN c.crime_type IN ({self._HOMICIDE_TYPES_PLACEHOLDERS}) THEN 1 ELSE 0 END) AS homicide_total "
            f"FROM crimes AS c JOIN neighborhoods AS n ON n.id = c.neighborhood_id {where_sql} "
            "GROUP BY n.id, n.neighborhood_name ORDER BY total DESC"
        )
        async with self._pool.acquire() as connection:
            async with connection.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(query, (*self._HOMICIDE_TYPES, *params))
                return await cursor.fetchall()

    async def count_by_municipality(
        self,
        crime_types: list[str] | None = None,
        ibge_ids: list[int] | None = None,
        severities: list[str] | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> list[dict]:
        where_sql, params = self._build_where(crime_types, ibge_ids, None, severities, start_date, end_date)
        query = (
            "SELECT m.ibge_id AS id, m.municipality_name AS name, COUNT(*) AS total, "
            f"SUM(CASE WHEN c.crime_type IN ({self._HOMICIDE_TYPES_PLACEHOLDERS}) THEN 1 ELSE 0 END) AS homicide_total, "
            "m.population AS population "
            f"FROM crimes AS c JOIN municipalities AS m ON m.ibge_id = c.ibge_id {where_sql} "
            "GROUP BY m.ibge_id, m.municipality_name, m.population ORDER BY total DESC LIMIT 15"
        )
        async with self._pool.acquire() as connection:
            async with connection.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(query, (*self._HOMICIDE_TYPES, *params))
                return await cursor.fetchall()

    @staticmethod
    def _build_where(
        crime_types: list[str] | None,
        ibge_ids: list[int] | None,
        neighborhood_ids: list[int] | None,
        severities: list[str] | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> tuple[str, tuple]:
        conditions = []
        params: list = []
        if crime_types:
            placeholders = ", ".join(["%s"] * len(crime_types))
            conditions.append(f"c.crime_type IN ({placeholders})")
            params.extend(crime_types)
        if ibge_ids:
            placeholders = ", ".join(["%s"] * len(ibge_ids))
            conditions.append(f"c.ibge_id IN ({placeholders})")
            params.extend(ibge_ids)
        if neighborhood_ids:
            placeholders = ", ".join(["%s"] * len(neighborhood_ids))
            conditions.append(f"c.neighborhood_id IN ({placeholders})")
            params.extend(neighborhood_ids)
        if severities:
            placeholders = ", ".join(["%s"] * len(severities))
            conditions.append(f"c.severity IN ({placeholders})")
            params.extend(severities)
        if start_date:
            conditions.append("c.reference_datetime >= %s")
            params.append(start_date)
        if end_date:
            conditions.append("c.reference_datetime <= %s")
            params.append(end_date)
        where_sql = f"WHERE {' AND '.join(conditions)}" if conditions else ""
        return where_sql, tuple(params)

