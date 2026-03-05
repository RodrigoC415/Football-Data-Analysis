from bs4 import BeautifulSoup
from app.database import get_connection
import os
import sys

# # Resolve the path relative to the project root
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(BASE_DIR, "data")

def clean_value(value: str):
    value = value.strip()
    
    # Empty
    if value in ("-", "", "N/D", "N/A"):
        return None
    
    # Height and weight: "179 cm" -> 179.0
    if value.endswith(" cm") or value.endswith(" kg"):
        return float(value.split()[0])
    
    # Salary: "193,000 € p/m" -> 193000.0
    if "€" in value and "p/m" in value:
        num = value.split("€")[0].strip()
        num = num.replace(",", "")
        try:
            return float(num)
        except ValueError:
            return None

    # Percentage: "64%" -> 64.0
    if value.endswith("%"):
        try:
            return float(value[:-1])
        except ValueError:
            return None
    
    # games in the bench: "32 (1)" -> 32
    if "(" in value:
        try:
            return int(value.split("(")[0].strip())
        except ValueError:
            return value

    # Distance: "371.6km" -> 371.6
    if value.endswith("km"):
        try:
            return float(value.replace("km", "").strip())
        except ValueError:
            return None
        
    # numbers with commas: "2,728" -> 2728
    try:
        return float(value.replace(",", ""))
    except ValueError:
        return value
    

# Mapping FM headers -> database columns
COLUMN_MAP = {
    "UID": "uid",
    "Name": "name",
    "Position": "position",
    "Age": "age",
    "Height": "height_cm",
    "Weight": "weight_kg",
    "Club": "club",
    "Division": "division",
    "Nat": "nationality",
    "Personality": "personality",
    "Preferred Foot": "preferred_foot",
    "Salary": "salary",
    "Transfer Value": "transfer_value",
    "Mins": "minutes",
    "Apps": "apps",
    "Gls": "goals",
    "Ast": "assists",
    "xG": "xg",
    "xG/90": "xg_90",
    "xA": "xa",
    "xA/90": "xa_90",
    "xG-OP": "xg_op",
    "Pas %": "pass_pct",
    "Pr Passes": "pr_passes",
    "Sprints/90": "sprints_90",
    "Int/90": "int_90",
    "Itc": "itc",
    "Tck/90": "tck_90",
    "Tck W": "tck_w",
    "Shots": "shots",
    "ShT": "sht",
    "Shot %": "shot_pct",
    "Gls/90": "gls_90",
    "Shutouts": "shutouts",
    "Conc": "conc",
    "All/90": "all_90",
    "Pres A": "pres_a",
    "Pres A/90": "pres_a_90",
    "Poss Won/90": "poss_won_90",
    "Drb": "drb",
    "Drb/90": "drb_90",
    "Blk": "blk",
    "Hdrs": "hdrs",
    "Hdr %": "hdr_pct",
    "Distance": "distance",
    "Av Rat": "av_rat",
}
def parse_html(filepath: str):

    if not os.path.isabs(filepath):
        filepath = os.path.join(DATA_DIR, filepath)
    # Extract the season from the name of the file
    season = os.path.splitext(os.path.basename(filepath))[0]
    
    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        soup = BeautifulSoup(f, "html.parser")
    
    rows = soup.find_all("tr")
    headers = [th.get_text(strip=True) for th in rows[0].find_all("th")]
    
    print(f"Season: {season}")
    print(f"Headers found: {len(headers)}")
    print(f"Rows found: {len(rows) - 1}")
    
    players = []
    for row in rows[1:]:
        cells = row.find_all("td")
        if not cells:
            continue

        raw = {headers[i]: cells[i].get_text(strip=True) for i in range(min(len(headers), len(cells)))}
    
        player = {}
        for fm_col, db_col in COLUMN_MAP.items():
            player[db_col] = clean_value(raw.get(fm_col, "-"))
    
        players.append(player)

    print(f"Players extracted: {len(players)}")
    print("Example:", players[0])

    return headers, players, season

def insert_players(players: list, season: str):
    conn = get_connection()
    cursor = conn.cursor()

    # Insert season and get its id
    cursor.execute("""
        INSERT INTO seasons (name) VALUES (%s)
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
    """, (season,))
    season_id = cursor.fetchone()[0]

    # Insert each player
    for player in players:
        cursor.execute("""
            INSERT INTO players (season_id, uid, name, position, age, height_cm, weight_kg,
                club, division, nationality, personality, preferred_foot, salary, transfer_value,
                minutes, apps, goals, assists, xg, xg_90, xa, xa_90, xg_op, pass_pct, pr_passes,
                sprints_90, int_90, itc, tck_90, tck_w, shots, sht, shot_pct, gls_90, shutouts,
                conc, all_90, pres_a, pres_a_90, poss_won_90, drb, drb_90, blk, hdrs, hdr_pct,
                distance, av_rat)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,
                    %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (season_id, player.get("uid"), player.get("name"), player.get("position"),
              player.get("age"), player.get("height_cm"), player.get("weight_kg"),
              player.get("club"), player.get("division"), player.get("nationality"),
              player.get("personality"), player.get("preferred_foot"), player.get("salary"),
              player.get("transfer_value"), player.get("minutes"), player.get("apps"),
              player.get("goals"), player.get("assists"), player.get("xg"), player.get("xg_90"),
              player.get("xa"), player.get("xa_90"), player.get("xg_op"), player.get("pass_pct"),
              player.get("pr_passes"), player.get("sprints_90"), player.get("int_90"),
              player.get("itc"), player.get("tck_90"), player.get("tck_w"), player.get("shots"),
              player.get("sht"), player.get("shot_pct"), player.get("gls_90"),
              player.get("shutouts"), player.get("conc"), player.get("all_90"),
              player.get("pres_a"), player.get("pres_a_90"), player.get("poss_won_90"),
              player.get("drb"), player.get("drb_90"), player.get("blk"), player.get("hdrs"),
              player.get("hdr_pct"), player.get("distance"), player.get("av_rat")))

    conn.commit()
    cursor.close()
    conn.close()
    print(f"Successfully inserted {len(players)} players for season {season}!")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python -m app.parser <ficheiro.html>")
        print("Example: python -m app.parser 2030-2031.html")
        sys.exit(1)
    
    headers, players, season = parse_html(sys.argv[1])
    insert_players(players, season)
    