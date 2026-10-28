import logging
from typing import Any, Generator
from psycopg_pool import ConnectionPool

from app.core.config import settings

logger = logging.getLogger(__name__)

pool = ConnectionPool(
    settings.database_url,
    min_size=1,
    max_size=5,
    open=False,
    max_idle=30.0,
    check=ConnectionPool.check_connection,
    kwargs={"prepare_threshold": None},
)


def get_db() -> Generator[Any, None, None]:
    """
    Standard database session/connection dependency.
    Warms up the connection pool, borrows a connection, and yields it.
    """
    if pool.closed:
        try:
            pool.open(wait=True, timeout=10)
        except Exception as exc:
            logger.error("Failed to open connection pool: %s", exc)
            yield None
            return

    try:
        with pool.connection() as conn:
            yield conn
    except Exception as exc:
        logger.error("Failed to acquire connection from pool: %s", exc)
        yield None
