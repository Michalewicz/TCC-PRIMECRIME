import aiomysql

from app.config import get_settings

_pool: aiomysql.Pool | None = None


async def init_db_pool() -> aiomysql.Pool:
    global _pool
    settings = get_settings()
    _pool = await aiomysql.create_pool(
        host=settings.db_host,
        port=settings.db_port,
        user=settings.db_user,
        password=settings.db_password,
        db=settings.db_name,
        minsize=settings.db_pool_minsize,
        maxsize=settings.db_pool_maxsize,
        autocommit=True,
    )
    return _pool


async def close_db_pool() -> None:
    global _pool
    if _pool is not None:
        _pool.close()
        await _pool.wait_closed()
        _pool = None


async def get_db_pool() -> aiomysql.Pool:
    if _pool is None:
        raise RuntimeError("Database pool has not been initialized.")
    return _pool
