from fastapi import APIRouter
from app.database import get_connection
from typing import Optional

router = APIRouter()


@router.get("/positions")
def get_positions(season_id: Optional[int] = None):
    conn = get_connection()
    cursor = conn.cursor()
    
    query = "SELECT DISTINCT position FROM players WHERE position IS NOT NULL"
    params = []
    if season_id:
        query += " AND season_id = %s"
        params.append(season_id)
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    order = ['GK', 'D (C)', 'D (L)', 'D (R)', 'WB (L)', 'WB (R)', 'DM', 'M (C)', 'M (L)', 'M (R)', 'AM (C)', 'AM (L)', 'AM (R)', 'ST (C)']
    
    all_positions = set()
    for row in rows:
        parts = [p.strip() for p in row[0].split(',')]
        all_positions.update(parts)
    
    sorted_positions = [p for p in order if p in all_positions]
    
    return sorted_positions


@router.get("/players")
def get_players(
    season_id: Optional[int] = None,
    club: Optional[str] = None,
    position: Optional[str] = None,
    name: Optional[str] = None,
    min_xg: Optional[float] = None,
    max_xg: Optional[float] = None,
    min_age: Optional[int] = None,
    max_age: Optional[int] = None,
    min_minutes: Optional[float] = None,
    min_xg_90: Optional[float] = None,
    min_xa_90: Optional[float] = None,
    min_gls_90: Optional[float] = None,
    min_shots_90: Optional[float] = None,
    min_shot_pct: Optional[float] = None,
    min_hdrs_90: Optional[float] = None,
    min_hdr_pct: Optional[float] = None,
    min_pres_a_90: Optional[float] = None,
    min_tck_90: Optional[float] = None,
    min_tck_w: Optional[float] = None,
    min_poss_won_90: Optional[float] = None,
    max_poss_lost_90: Optional[float] = None,
    min_pass_pct: Optional[float] = None,
    min_pass_cmp_90: Optional[float] = None,
    min_pr_passes_90: Optional[float] = None,
    min_drb_90: Optional[float] = None,
    min_all_90: Optional[float] = None,
    min_shutouts: Optional[float] = None,
    min_xgp_90: Optional[float] = None,
    max_all_90: Optional[float] = None,
    min_conc: Optional[float] = None,
    sort_by: Optional[str] = "xg",
    sort_dir: Optional[str] = "desc",
    page: Optional[int] = 1,
):
    conn = get_connection()
    cursor = conn.cursor()

    query = """
    SELECT id, uid, name, position, age, club, division, nationality, minutes, goals, assists,
           xg, xg_90, xa, xa_90, pass_pct, pr_passes, sprints_90, int_90, av_rat, tck_w, tck_90,
           gls_90, poss_won_90, poss_lost_90, pres_a_90, drb_90, hdr_pct, shot_pct, pass_cmp_90,transfer_value,
           CASE WHEN minutes > 0 THEN ROUND(shots::numeric / NULLIF(minutes::numeric, 0) * 90, 2) ELSE 0 END as shots_90,
           CASE WHEN minutes > 0 THEN ROUND(hdrs::numeric / NULLIF(minutes::numeric, 0) * 90, 2) ELSE 0 END as hdrs_90,
           CASE WHEN minutes > 0 THEN ROUND(pr_passes::numeric / NULLIF(minutes::numeric, 0) * 90, 2) ELSE 0 END as pr_passes_90
    FROM players WHERE 1=1
    """
    params = []

    if season_id:
        query += " AND season_id = %s"
        params.append(season_id)
    if name:
        query += " AND name ILIKE %s"
        params.append(f"%{name}%")
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
    if min_xg_90 is not None:
        query += " AND xg_90 >= %s"
        params.append(min_xg_90)
    if min_xa_90 is not None:
        query += " AND xa_90 >= %s"
        params.append(min_xa_90)
    if min_gls_90 is not None:
        query += " AND gls_90 >= %s"
        params.append(min_gls_90)
    if min_shots_90 is not None:
        query += " AND ROUND(shots::numeric / NULLIF(minutes::numeric, 0) * 90, 2) >= %s"
        params.append(min_shots_90)
    if min_shot_pct is not None:
        query += " AND shot_pct >= %s"
        params.append(min_shot_pct)
    if min_hdrs_90 is not None:
        query += " AND ROUND(hdrs::numeric / NULLIF(minutes::numeric, 0) * 90, 2) >= %s"
        params.append(min_hdrs_90)
    if min_hdr_pct is not None:
        query += " AND hdr_pct >= %s"
        params.append(min_hdr_pct)
    if min_pres_a_90 is not None:
        query += " AND pres_a_90 >= %s"
        params.append(min_pres_a_90)
    if min_tck_90 is not None:
        query += " AND tck_90 >= %s"
        params.append(min_tck_90)
    if min_tck_w is not None:
        query += " AND tck_w >= %s"
        params.append(min_tck_w)
    if min_poss_won_90 is not None:
        query += " AND poss_won_90 >= %s"
        params.append(min_poss_won_90)
    if max_poss_lost_90 is not None:
        query += " AND poss_lost_90 <= %s"
        params.append(max_poss_lost_90)
    if min_pass_pct is not None:
        query += " AND pass_pct >= %s"
        params.append(min_pass_pct)
    if min_pass_cmp_90 is not None:
        query += " AND pass_cmp_90 >= %s"
        params.append(min_pass_cmp_90)
    if min_pr_passes_90 is not None:
        query += " AND ROUND(pr_passes::numeric / NULLIF(minutes::numeric, 0) * 90, 2) >= %s"
        params.append(min_pr_passes_90)
    if min_drb_90 is not None:
        query += " AND drb_90 >= %s"
        params.append(min_drb_90)
    if min_all_90 is not None:
        query += " AND all_90 >= %s"
        params.append(min_all_90)
    if min_shutouts is not None:
        query += " AND shutouts >= %s"
        params.append(min_shutouts)
    if min_conc is not None:
        query += " AND conc <= %s"
        params.append(min_conc)
    if min_xgp_90 is not None:
        query += " AND xgp_90 >= %s"
        params.append(min_xgp_90)
    if max_all_90 is not None:
        query += " AND all_90 <= %s"
        params.append(max_all_90)

    allowed_sort = ["name", "position", "age", "club", "goals", "assists", "xg", "xg_90", "xa_90", "pass_pct", "av_rat", "minutes"]
    if sort_by not in allowed_sort:
        sort_by = "xg"
    order = "ASC" if sort_dir == "asc" else "DESC"
    offset = (page - 1) * 50
    query += f" ORDER BY {sort_by} {order} NULLS LAST LIMIT 50 OFFSET %s"
    params.append(offset)

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