import aiomysql


class NeighborhoodsRepository:
    def __init__(self, pool: aiomysql.Pool):
        self._pool = pool

    async def list_by_municipality(self, ibge_id: int) -> list[dict]:
        query = (
            "SELECT id, ibge_id, neighborhood_name "
            "FROM neighborhoods WHERE ibge_id = %s ORDER BY neighborhood_name"
        )
        async with self._pool.acquire() as connection:
            async with connection.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(query, (ibge_id,))
                return await cursor.fetchall()
