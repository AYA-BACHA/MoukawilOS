from psycopg_pool import ConnectionPool

from app.core.config import settings

pool = ConnectionPool(
    settings.database_url,
    min_size=1,
    max_size=5,
    open=False,
    max_idle=30.0,
    check=ConnectionPool.check_connection,
    kwargs={"prepare_threshold": None},
)