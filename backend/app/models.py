from app.database import get_connection

def create_tables():
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS epocas (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(20) UNIQUE NOT NULL,
            data_importacao TIMESTAMP DEFAULT NOW()
        );
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS jogadores (
            id SERIAL PRIMARY KEY,
            epoca_id INTEGER REFERENCES epocas(id),
            idu BIGINT,
            nome VARCHAR(100),
            posicao VARCHAR(100),
            idade INTEGER,
            clube VARCHAR(100),
            divisao VARCHAR(100),
            nacionalidade VARCHAR(10),
            minutos REAL,
            jogos REAL,
            golos REAL,
            assistencias REAL,
            xg REAL,
            xg_90 REAL,
            xa REAL,
            xa_90 REAL,
            xg_ace REAL,
            pct_passe REAL,
            passes_prog REAL,
            sprints_90 REAL,
            int_90 REAL,
            des_90 REAL,
            crt REAL,
            blq REAL,
            remates REAL,
            rem_pct REAL,
            gls_90 REAL,
            press_tent REAL,
            pr_t_90 REAL,
            cab_p90 REAL,
            clean_sheets REAL,
            golos_sofridos REAL,
            sof_90 REAL,
            salario REAL,
            valor_estimado VARCHAR(50),
            pe_preferido VARCHAR(20),
            personalidade VARCHAR(50),
            altura_cm REAL,
            peso_kg REAL
        );
    """)

    conn.commit()
    cursor.close()
    conn.close()
    print("Tabelas criadas com sucesso!")

if __name__ == "__main__":
    create_tables()