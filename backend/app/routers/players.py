from fastapi import APIRouter, Query
from app.database import get_connection
from typing import Optional

router = APIRouter()

@router.get("/players")
def get_players(
    season_id: Optional[int] = None,
    club: Optional[str] = None,
    position: Optional[str] = None,
    min_xg: Optional[float] = None,
    max_xg: Optional[float] = None,
    min_age: Optional[int] = None,
    max_age: Optional[int] = None,
    min_minutes: Optional[float] = None,
):
    conn = get_connection()
    cursor = conn.cursor()

    query = """
    SELECT id, uid, name, position, age, club, division, nationality, minutes, goals, assists,
           xg, xg_90, xa, xa_90, pass_pct, pr_passes, sprints_90, int_90, av_rat, tck_w, tck_90,
           gls_90, poss_won_90, pres_a_90, drb_90, hdr_pct, shot_pct,
           CASE WHEN minutes > 0 THEN ROUND(shots::numeric / NULLIF(minutes::numeric, 0) * 90, 2) ELSE 0 END as shots_90,
           CASE WHEN minutes > 0 THEN ROUND(hdrs::numeric / NULLIF(minutes::numeric, 0) * 90, 2) ELSE 0 END as hdrs_90,
           CASE WHEN minutes > 0 THEN ROUND(pr_passes::numeric / NULLIF(minutes::numeric, 0) * 90, 2) ELSE 0 END as pr_passes_90
    FROM players WHERE 1=1
    """
    params = []

    if season_id:
        query += " AND season_id = %s"
        params.append(season_id)
    if club:
        query += " AND club ILIKE %s"
        params.append(f"%{club}%")
    if position:
        query += " AND position ILIKE %s"
        params.append(f"%{position}%")
    if min_xg is not None:
        query += " AND xg >= %s"
        params.append(min_xg)
    if max_xg is not None:
        query += " AND xg <= %s"
        params.append(max_xg)
    if min_age is not None:
        query += " AND age >= %s"
        params.append(min_age)
    if max_age is not None:
        query += " AND age <= %s"
        params.append(max_age)
    if min_minutes is not None:
        query += " AND minutes >= %s"
        params.append(min_minutes)

    query += " ORDER BY xg DESC NULLS LAST LIMIT 100"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description]

    cursor.close()
    conn.close()

    return [dict(zip(columns, row)) for row in rows]


@router.get("/players/{uid}")
def get_player(uid: int):
    conn = get_connection()
    cursor = conn.cursor()

    
    cursor.execute("""
    SELECT p.*, s.name as season_name,
           CASE WHEN p.minutes > 0 THEN ROUND(p.shots::numeric / NULLIF(p.minutes::numeric, 0) * 90, 2) ELSE 0 END as shots_90,
           CASE WHEN p.minutes > 0 THEN ROUND(p.hdrs::numeric / NULLIF(p.minutes::numeric, 0) * 90, 2) ELSE 0 END as hdrs_90,
           CASE WHEN p.minutes > 0 THEN ROUND(p.pr_passes::numeric / NULLIF(p.minutes::numeric, 0) * 90, 2) ELSE 0 END as pr_passes_90
    FROM players p
    JOIN seasons s ON p.season_id = s.id
    WHERE p.uid = %s
    ORDER BY s.name DESC
    """, (uid,))
    
    rows = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description]

    cursor.close()
    conn.close()

    if not rows:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Player not found")

    return [dict(zip(columns, row)) for row in rows]