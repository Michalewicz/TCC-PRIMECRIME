import aiomysql


class MunicipalitiesRepository:
    def __init__(self, pool: aiomysql.Pool):
        self._pool = pool

    async def list_all(self) -> list[dict]:
        query = (
            "SELECT ibge_id, municipality_name, area_km2, population, uf_id "
            "FROM municipalities ORDER BY municipality_name"
        )
        async with self._pool.acquire() as connection:
            async with connection.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(query)
                return await cursor.fetchall()

    async def exists(self, ibge_id: int) -> bool:
        query = "SELECT 1 FROM municipalities WHERE ibge_id = %s"
        async with self._pool.acquire() as connection:
            async with connection.cursor() as cursor:
                await cursor.execute(query, (ibge_id,))
                return await cursor.fetchone() is not None

    async def filter_existing(self, ibge_ids: list[int]) -> set[int]:
        if not ibge_ids:
            return set()
        placeholders = ", ".join(["%s"] * len(ibge_ids))
        query = f"SELECT ibge_id FROM municipalities WHERE ibge_id IN ({placeholders})"
        async with self._pool.acquire() as connection:
            async with connection.cursor() as cursor:
                await cursor.execute(query, tuple(ibge_ids))
                rows = await cursor.fetchall()
        return {row[0] for row in rows}
