from app.database import get_connection

def create_tables():
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS seasons (
            id SERIAL PRIMARY KEY,
            name VARCHAR(20) UNIQUE NOT NULL,
            imported_at TIMESTAMP DEFAULT NOW()
        );
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS players (
            id SERIAL PRIMARY KEY,
            season_id INTEGER REFERENCES seasons(id),
            uid BIGINT,
            name VARCHAR(100),
            position VARCHAR(100),
            age INTEGER,
            height_cm REAL,
            weight_kg REAL,
            club VARCHAR(100),
            division VARCHAR(100),
            nationality VARCHAR(10),
            personality VARCHAR(50),
            preferred_foot VARCHAR(20),
            salary REAL,
            transfer_value VARCHAR(50),
            minutes REAL,
            apps REAL,
            goals REAL,
            assists REAL,
            xg REAL,
            xg_90 REAL,
            xa REAL,
            xa_90 REAL,
            xg_op REAL,
            pass_pct REAL,
            pr_passes REAL,
            sprints_90 REAL,
            int_90 REAL,
            itc REAL,
            tck_90 REAL,
            tck_w REAL,
            shots REAL,
            sht REAL,
            shot_pct REAL,
            gls_90 REAL,
            shutouts REAL,
            conc REAL,
            all_90 REAL,
            pres_a REAL,
            pres_a_90 REAL,
            poss_won_90 REAL,
            drb REAL,
            drb_90 REAL,
            blk REAL,
            hdrs REAL,
            hdr_pct REAL,
            distance REAL,
            av_rat REAL
        );
    """)

    conn.commit()
    cursor.close()
    conn.close()
    print("Tabelas criadas com sucesso!")

if __name__ == "__main__":
    create_tables()