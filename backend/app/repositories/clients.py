from psycopg.errors import UniqueViolation

from app.core.db import pool
from app.schemas.clients import ClientCreate, ClientOut, ClientUpdate


class DuplicateNif(Exception):
    pass


COLUMNS = """c.id, t.code, c.name, c.address, c.country, c.rc, c.nif, c.nis,
             c.email, c.phone, c.archived_at, c.created_at"""

FROM = """public.clients c
          join public.client_types t on t.id = c.client_type_id"""


def _to_out(r) -> ClientOut:
    return ClientOut(
        id=r[0], client_type=r[1], name=r[2], address=r[3], country=r[4],
        rc=r[5], nif=r[6], nis=r[7], email=r[8], phone=r[9],
        archived_at=r[10], created_at=r[11],
    )


def create(freelancer_id: int, d: ClientCreate) -> ClientOut:
    try:
        with pool.connection() as conn:
            new_id = conn.execute(
                """
                insert into public.clients
                  (freelancer_id, client_type_id, name, address,
                   rc, nif, nis, email, phone)
                values (%s, (select id from public.client_types where code = %s),
                        %s, %s, %s, %s, %s, %s, %s)
                returning id
                """,
                (freelancer_id, d.client_type, d.name, d.address,
                 d.rc, d.nif, d.nis, d.email, d.phone),
            ).fetchone()[0]
    except UniqueViolation as exc:
        raise DuplicateNif() from exc
    return get(freelancer_id, new_id)


def get(freelancer_id: int, client_id: int) -> ClientOut | None:
    with pool.connection() as conn:
        r = conn.execute(
            f"select {COLUMNS} from {FROM} where c.id = %s and c.freelancer_id = %s",
            (client_id, freelancer_id),
        ).fetchone()
    return _to_out(r) if r else None


def list_all(freelancer_id: int, archived: bool, q: str | None,
             limit: int, offset: int) -> tuple[list[ClientOut], int]:
    where = ["c.freelancer_id = %s",
             "c.archived_at is not null" if archived else "c.archived_at is null"]
    params: list = [freelancer_id]
    if q:
        where.append("(c.name ilike %s or c.nif ilike %s)")
        like = f"%{q.strip()}%"
        params += [like, like]
    w = " and ".join(where)
    with pool.connection() as conn:
        total = conn.execute(
            f"select count(*) from {FROM} where {w}", params).fetchone()[0]
        rows = conn.execute(
            f"select {COLUMNS} from {FROM} where {w} "
            f"order by c.name, c.id limit %s offset %s",
            (*params, limit, offset),
        ).fetchall()
    return [_to_out(r) for r in rows], total


def update(freelancer_id: int, client_id: int, d: ClientUpdate) -> ClientOut | None:
    try:
        with pool.connection() as conn:
            row = conn.execute(
                """
                update public.clients
                set client_type_id = (select id from public.client_types where code = %s),
                    name = %s, address = %s, rc = %s, nif = %s, nis = %s,
                    email = %s, phone = %s
                where id = %s and freelancer_id = %s
                returning id
                """,
                (d.client_type, d.name, d.address, d.rc, d.nif, d.nis,
                 d.email, d.phone, client_id, freelancer_id),
            ).fetchone()
    except UniqueViolation as exc:
        raise DuplicateNif() from exc
    return get(freelancer_id, client_id) if row else None


def set_archived(freelancer_id: int, client_id: int, archived: bool) -> ClientOut | None:
    with pool.connection() as conn:
        row = conn.execute(
            f"""
            update public.clients
            set archived_at = {"now()" if archived else "null"}
            where id = %s and freelancer_id = %s
            returning id
            """,
            (client_id, freelancer_id),
        ).fetchone()
    return get(freelancer_id, client_id) if row else None